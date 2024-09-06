<template lang="html">
  <div class="editor">
    <div ref="editor" class="textNeirong"></div>
  </div>
</template>

<script>
import E from 'wangeditor'
export default {
  name: 'editoritem',
  data() {
    return {
      // uploadPath,components
      editor: null,
      info_: null
      //   token: ''
    }
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: {
      type: String,
      default: ''
    },
    isClear: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    isClear(val) {
      // 触发清除文本域内容
      if (val) {
        this.editor.txt.clear()
        this.info_ = null
      }
    },
    value: function (value) {
      if (value !== this.editor.txt.html()) {
        this.editor.txt.html(this.value)
      }
    }
    //value为编辑框输入的内容，这里我监听了一下值，当父组件调用得时候，如果给value赋值了，子组件将会显示父组件赋给的值
  },
  created() {
    // this.token = 'Bearer ' + store.getters.access_token
  },
  mounted() {
    this.seteditor()
    this.editor.txt.html(this.value)
  },
  methods: {
    seteditor() {
      this.editor = new E(this.$refs.editor)
      //默认情况下会显示所有的菜单，配置如下：
      //   this.editor.config.menus = ['bold', 'head', 'link', 'italic', 'underline'],//定义显示哪些菜单和菜单的顺序
      this.editor.config.excludeMenus = ['code', 'video'],//设置不需要的菜单
      this.editor.config.showLinkVideo = false,//不显示网络视频上传
      this.editor.config.uploadImgShowBase64 = false // base 64 存储图片
      this.editor.config.uploadImgServer = 'xxxx' // 填写配置服务器端地址
      //   this.editor.config.uploadImgHeaders = { Authorization: this.token } // 自定义 header
      this.editor.config.uploadFileName = 'file' // 后端接受上传文件的参数名
      this.editor.config.uploadImgMaxSize = 8 * 1024 * 1024 // 将图片大小限制为 2M
      this.editor.config.uploadImgMaxLength = 6 // 限制一次最多上传 6 张图片
      this.editor.config.uploadImgTimeout = 3 * 60 * 1000 // 设置超时时间
      // 自定义 onchange 触发的延迟时间，默认为 200 ms
      this.editor.config.onchangeTimeout = 1000 // 单位 ms
      this.editor.config.onchange = html => {
        this.info_ = html // 绑定当前逐渐地值
        this.$emit('change', this.info_) // 将内容同步到父组件中
      }
      // 创建富文本编辑器
      this.editor.create()
      this.editor.config.uploadImgHooks = {
        fail: (xhr, editor, result) => {
          // 插入图片失败回调
          console.log(xhr, editor, result)
        },
        success: (xhr, editor, result) => {
          // 图片上传成功回调
          console.log(xhr, editor, result)
        },
        timeout: (xhr, editor) => {
          // 网络超时的回调
          console.log(xhr, editor)
        },
        error: (xhr, editor) => {
          // 图片上传错误的回调
          console.log(xhr, editor)
        },
        customInsert: (insertImg, result, editor) => {
          console.log(result.FileAddress)
          //循环插入图片--回显图片
          let url = 'xxxx' + result.FileAddress
          insertImg(url)
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.editor {
  z-index: 3;
  width: 100%;
  margin: auto;
  position: relative;
}
</style>

