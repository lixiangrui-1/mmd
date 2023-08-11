import { defineComponent, inject, onMounted, ref, Ref } from "vue";
import InitThreeJs from "../../hooks/initThreeJs";
import style from './index.module.stylus'

export default defineComponent({
  setup () {
    const warp = ref<Ref | null>(null)
    const topBtn = inject<Ref<Array<{ name: string, children: Array<{ name: string, callback: () =>void } | never > }>>>('topBtn', ref([]))
    const setTopBtn = () => {
      topBtn.value = [
        { name: 'MMD 播放器', children: [] },
        { name: '编辑', children: [
          { name: '录制', callback: getDisplayMedia },
          { name: '暂停录制', callback: () => offDisplayMedia },
          { name: '结束录制', callback: () => {
            removeStream(offDisplayMedia())
          } },
          { name: '导出视频', callback: () => {
            getNewFileHandle(new Blob(videoDataList, { type: 'video/webm' })).then((writable: any) => {
              writable.close()
            }).catch((err: Error) => {
              console.log(err)
            })
          }},
        ]}
      ]
    }
    const MMD = new InitThreeJs()
    const getNewFileHandle = (blob: BlobPart) => {
      const opts: any = {
        suggestedName: '纸片人3.0',
        types: [{
            description: "MMD video",
            accept: { "video/webm": [".webm"] },
        }],
      };
      
      const fileSystemFileHandle: any = window.showSaveFilePicker(opts)

      return fileSystemFileHandle
        .then((fileHandle: any) => fileHandle.createWritable())
        .then((writable: any) => writable.write(blob).then(() => writable))
    }
    let offDisplayMedia: () => null | MediaStream = () => null
    const removeStream = (stream: MediaStream | null) => {
      if (!stream) return
      stream.getTracks().forEach(track => {
        track.stop()
      });
    }
    const getDisplayMedia = () => {
      navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
        .then(function(stream) {
          const mediaRecorder = createMediaRecorder(stream)
          mediaRecorder.start()
          offDisplayMedia = () => {
            mediaRecorder.stop()
            return stream
          }
        })
        .catch(function(err) {
          console.log(err)
        });
    }
    const videoDataList: BlobPart[] | undefined = []
    const createMediaRecorder = (stream: MediaStream) => {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm",
      });
      mediaRecorder.ondataavailable = function (event) {
        
        if (event.data && event.data.size) {
          videoDataList.push(event.data);
        }
      };

      return mediaRecorder
    }

    onMounted(() => {
      let positionY = 200
      setTopBtn()
        if (warp.value) {
          MMD
            .setRenderer(warp.value.clientWidth, warp.value.clientHeight + positionY)
            .mountRenderer(warp.value)
            .createdCamera(45, warp.value.clientWidth / (warp.value.clientHeight + positionY), 0.8)
            .createControl()
            .loadSceneLayoutOrStaticModel('src/assets/jingtu/Belobog.pmx', -9)
            // .loadModel('src/assets/jingliu/jingliu.pmx', 'src/assets/jingtu/jingtu.vmd')
            .loadModel('src/assets/kl2/kl2.pmx', 'src/assets/Specialist/mmd_Specialist_motion.vmd', -8)
            // .loadModel('src/assets/shenzi/shenzi.pmx', 'src/assets/12/Miku.vmd')
            // .loadModel('src/assets/jingliu/jingliu.pmx', 'src/assets/12/Luka.vmd')
            // .loadModel('src/assets/jingliu/jingliu.pmx', 'src/assets/12/Haku.vmd')
            // .loadModel('src/assets/jingliu/jingliu.pmx', 'src/assets/12/Rin.vmd')
            // .loadModel('src/assets/jingliu/jingliu.pmx', 'src/assets/12/Teto.vmd')
            // .loadAnimat('src/assets/Specialist/CameraMAIN2.vmd')
            // .loadAnimat('src/assets/jingtu/camera.vmd')
            .loadAnimat('src/assets/Pico/camera.vmd')
            .addLight(0xefefef, { x: 50, y: 50, z: 50 })
            // .loadAudio('src/assets/jingtu/GARNiDELiA.m4a')
            // .loadAudio('src/assets/12/bgm.mp3')
            .loadAudio('src/assets/Specialist/music001.wav')
            .onReady((state) => {
              if (state === 'over') {
                MMD.animationPlay()
              }    
            })
        }
      
    })
    return () => (
      <div ref={warp}  class={style.warp}>
        
      </div>
    )
  }
})