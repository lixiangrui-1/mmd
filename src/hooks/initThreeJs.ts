import * as threeJs from 'three'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { MMDLoader } from "three/examples/jsm/loaders/MMDLoader";
import { MMDAnimationHelper } from "three/examples/jsm/animation/MMDAnimationHelper";

interface IthreeJs {
  /**
   * @name 容器
  */
  renderer: threeJs.WebGLRenderer | undefined
  /**
   * @name 相机
  */
  camera: threeJs.PerspectiveCamera | undefined
  /**
   * @name 场景
  */
  scene: threeJs.Scene | undefined
  /**
   * @name 镜头控制器
  */
  control: OrbitControls | undefined
  /**
   * @name 内部校准时钟
  */
  clock: threeJs.Clock
  /**
   * @name ammd模型加载器 
  */
  MMDLoader: MMDLoader
  /**
   * @name 动作执行器
  */
  helper: MMDAnimationHelper
  /**
   * @name 音频对象
  */
  audioListener: threeJs.AudioListener
  /**
   * @name 设置canvas容器大小
  */
  setRenderer: (width: number, height: number) => this 
  /**
   * @name 挂载canvas容器
  */
  mountRenderer: (dom: HTMLElement) => this
  /**
   * @name 创建相机
  */
  createdCamera: (long: number, ratioSize: number, zoom: number) => this
  /**
   * @name 创建相机控制器
  */
  createControl: () => this
  /**
   * @name 加载ammd模型
  */
  loadModel: (modelPath: string, vmdPath: string, positionY: number) => this
  /**
   * @name 加载动作动画/相机动画
  */
  loadAnimat: (vmdPath: string) => this
  /**
   * @name 加载背景音频
  */
  loadAudio: (audioPath: string) => this
  /**
   * @name 添加灯光
  */
  addLight: (color: number, { x, y, z }: { x: number, y:number, z: number }) => this
  /**
   * @name 添加配布&静态模型
  */
  loadSceneLayoutOrStaticModel: (path: string, positionY: number) => this
  /**
   * @name 资源加载状态&进度
  */
  onReady: (fn: (state: string) => void) => void
  /**
   * @name 执行动画
  */
  animationPlay: () => void
  /**
   * @name 暂停动画
  */
  animationShop: () => void
}

interface IeventListener {
  [props:string] : any[]
}

class InitThreeJs implements IthreeJs {
  private listMap: Map <string, Promise<() => void>> = new Map()
  private animationId: number = 0
  clock = new threeJs.Clock()
  renderer = new threeJs.WebGLRenderer( { antialias: true } )
  scene = new threeJs.Scene()
  MMDLoader = new MMDLoader()
  audio: threeJs.Audio<GainNode> | null = null
  helper = new MMDAnimationHelper()
  audioListener = new threeJs.AudioListener();
  camera: threeJs.PerspectiveCamera | undefined // 相机
  control: OrbitControls | undefined

  private eventListener: IeventListener = { playOver: [] }
  private test =  [ [0, 15, 48], [8, 11, 29], [-10, 10, 49], [0, 14, 45] ]
  private index = 0
  private x = 0
  private y = 0
  private z = 0
  constructor () {
    this.index = 0
    if (this.audio) {
      this.audio.stop()
      this.audio = null
    }
  }
  setRenderer (width: number, height: number) {
    this.renderer?.setSize(width, height)
    this.renderer.setPixelRatio(window.devicePixelRatio);
    return this
  }
  getRenderer () {
    return this.renderer
  }
  mountRenderer (dom: HTMLElement) {
    if (this.renderer) {
      dom.appendChild(this.renderer?.domElement)
      return this
    } else {
      throw new Error('Container not created')
    }
  }
  createdCamera (long: number, ratioSize: number, zoom:number) {
    this.camera = new threeJs.PerspectiveCamera(long, ratioSize, 1, 2000)
    this.camera.position.z = 80
    this.camera.position.x = 0
    this.camera.position.y = 15
    this.camera.zoom = zoom // 相机缩放
    this.camera.lookAt(this.camera.position)
    return this
  }
  
  createControl () {
    if (this.camera) {
      this.control = new OrbitControls(this.camera, this.renderer?.domElement)
      return this
    } else {
      throw new Error('The camera was not created and the controller could not be loaded')
    }
  }
  loadModel ( modelPath:string, vmdPath: string, positionY: number = 0) {
    let load: Promise<() => void> = new Promise(resolve => {
      this.MMDLoader.loadWithAnimation(
        modelPath, vmdPath,
        (mmd) => {
          mmd.mesh.position.y = positionY
          resolve(() => {
            this.helper.add(mmd.mesh, {
              animation: mmd.animation,
              physics: true
            })
            this.scene.add(mmd.mesh)
            this.listMap.delete(modelPath + vmdPath)
          })
        },
        (xhr) => {
          console.log(`模型/动作数据[${modelPath}, ${vmdPath}]加载进度: ${xhr.loaded / xhr.total * 100}%`);
        },
        (err) => {
          resolve(() => { // 懒得动了 错误就这么捕获了
            console.error(err)
          })
        }
      )
    })
    // 收集异步队列 多次加载模型名称可能重复
    this.listMap.set(modelPath + vmdPath, load)
    return this
  }
  // mmd 场景配布也是一个pmx 模型与加载单模型使用一个方法
  loadSceneLayoutOrStaticModel (layoutPath: string, positionY: number = 0) {
    let load:Promise<() => void> = new Promise(resolve => {
      this.MMDLoader.load(layoutPath, (mesh) => {
        mesh.position.y = positionY
        resolve(() => {
          this.scene.add(mesh)
          this.listMap.delete(layoutPath)
        })
      }, (xhr) => {
        console.log(`模型 [${layoutPath}]加载进度: ${xhr.loaded / xhr.total * 100}%`);
      }, (err) => {
        resolve(() => {
          console.log(err)
        })
      })
    })
    this.listMap.set(layoutPath, load)
    return this
  }
  private addModelInscene (mesh: threeJs.SkinnedMesh<threeJs.BufferGeometry, threeJs.Material | threeJs.Material[]> | null, error: ErrorEvent | null, index: number ): Promise<boolean> {
    return new Promise((resolve, rejcet) => {
      if (mesh) {
        console.info(`model${index}加载完成`)
        this.helper.add( mesh, {
          animation: mesh.animations
      } );
        this.scene.add(mesh)
        this.helper.update( this.clock.getDelta() );
        resolve(true)
      } else {
        console.error(`model${index}加载失败：${error}`)
        rejcet(false)
      }
      
    })
  }
  loadAnimat ( vmdPath: string ) {
    let load:Promise<() => void> = new Promise(resolve => {
      this.MMDLoader.loadAnimation(vmdPath, this.camera as threeJs.PerspectiveCamera, (animations) => {
        resolve(() => {
          this.helper.add(this.camera as threeJs.PerspectiveCamera,{
            animation: animations as threeJs.AnimationClip
          })
          this.listMap.delete(vmdPath)
        }) 
      },
      (xhr) => {
        console.log(`模型/动作数据[${vmdPath}]加载进度: ${xhr.loaded / xhr.total * 100}%`);
      },
      (err) => {
        resolve(() => { // 懒得动了 错误就这么捕获了
          console.error(err)
        })
      })
    })
    // 收集任务队列方式资源load 时机不一致
    this.listMap.set(vmdPath, load)
    return this
  }
  loadAudio ( audioPath: string ) {
    if (this.audio) {
      this.audio.stop()
      this.audio = null
    }
    const audioLoader = new threeJs.AudioLoader()
    let load: Promise<() => void> = new Promise(resolve => {
      audioLoader.load(audioPath, (buffer) => {
        this.audio = new threeJs.Audio( this.audioListener ).setBuffer( buffer );
        
        this.audioListener.position.z = 1;
        this.audio.autoplay = false
        this.helper.add(this.audio as threeJs.Audio<GainNode>)
        this.scene.add( this.audio as threeJs.Audio<GainNode> );
        this.scene.add( this.audioListener );
        
        resolve(() => {
          // 如果载入背景音乐动画帧跟随音乐节奏播放停止
          
          this.audio!.onEnded = this.animationShop.bind(this)
          this.listMap.delete(audioPath)
        })
  
      },
      (xhr) => {
        console.log(`音频数据[${audioPath}]加载进度: ${xhr.loaded / xhr.total * 100}%`);
      },
      (err) => {
        resolve(() => { // 懒得动了 错误就这么捕获了
          console.error(err)
        })
      })
    })
    
    this.listMap.set(audioPath, load)

    return this
  }
  addLight ( color: number, { x, y, z }: { x: number; y: number; z: number; } ) {
    const light = new threeJs.AmbientLight(color)
    light.position.set( x, y, z );
    this.scene.add( light );
    return this
  }
  onReady (fn: (state: string) => any) {
    
    Promise.all(this.listMap.values()).then(res => {
      // 集中执行收集到的异步回调同步资源
      res.forEach(item => {
        // 错误时不清楚异步队列值 后面动画帧直接根据队列size 判断资源是否全部加在完成
        item()
      })
      const playOverEffect: any = fn('over')
      this.eventListener.playOver.push(playOverEffect)
    })
    return this
  }
  change (x:number, y: number, z: number) {
    console.log(x, y, z, 123);
    
    this.camera!.position.x = x
    this.camera!.position.y = y
    this.camera!.position.z = z
  }
  animationPlay () {
    if (!this.camera) throw new Error('Camera not created, unable to perform animation')
       
    if (this.listMap.size === 0) {
      // this.index++
      // if (this.index % 300 === 0) {
      //   [ this.x, this.y, this.z ] = this.test[ Math.floor((this.index / 300) % 3) ]
      //   this.change(this.x, this.y, this.z)
      // }
      
      
      this.renderer.render(this.scene, this.camera as threeJs.PerspectiveCamera)
      this.helper.update( this.clock.getDelta() );
    } else {
      this.audio?.stop()
      throw new Error('部分资源加载失败！') // 错误捕获暂时就不实现了
    }

    this.control?.update()
    
    this.animationId = requestAnimationFrame(this.animationPlay.bind(this))
  }
  animationShop () {
    this.eventListener.playOver.forEach(item => {
      typeof item === 'function' && item()
    })
    window.cancelAnimationFrame(this.animationId)
  }
}


export default InitThreeJs