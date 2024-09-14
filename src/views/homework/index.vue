<template>
  <div>
    <div class="content-container">
      <div class="search-form">
        <el-form ref="examForm" :inline="true" :model="query" label-width="100px" class="examForm">
          <el-form-item label="类型" prop="type">
            <el-select v-model="query.type" placeholder="请选择" size="small">
              <el-option label="学校作业" value="0"></el-option>
              <el-option label="补习作业" value="1"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="阶段" prop="stage">
            <el-select v-model="query.stage" placeholder="请选择" size="small" @change="changeStage">
              <el-option v-for="item in stageOptions" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="年级" prop="grade">
            <el-select v-model="query.grade" placeholder="请选择" size="small" @change="changeGrade">
              <el-option v-for="item in gradeOptions" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="课程" prop="courseName">
            <el-select v-model="query.courseName" placeholder="请选择" size="small">
              <el-option v-for="item in courseOptions" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="作业标题" prop="title">
            <el-input v-model="query.title" autocomplete="off" size="small" />
          </el-form-item>
          <el-form-item label="作业时间" prop="date">
            <el-date-picker v-model="query.date" type="date"  default-time="12:00:00" placeholder="选择日期" size="small" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="query.status" size="small">
              <el-option label="未完成" value="0"></el-option>
              <el-option label="已完成" value="1"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitForm('examForm')" size="small">{{
          $t("search")
        }}</el-button>
            <el-button @click="resetForm('examForm')" size="small">{{
          $t("reset")
        }}</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="course-card-list">
        <transition name="fade-transform" mode="out-in" v-for="course in list" :key="course.id">
          <div class="single-popular-course">
            <!-- <img src="https://img0.baidu.com/it/u=918592680,685611776&fm=253&fmt=auto&app=120&f=JPEG?w=607&h=405"
              :alt="course.title" /> -->
            <div style="display: flex;flex-direction: column;margin:20px">
              <h3>科目：{{ course.courseName }}</h3>
              <h3>标题:{{ course.title }}</h3>
              <h3>布置时间:{{ course.date }}</h3>
              <h3>完成情况:{{ course.status == '0' ? '未完成' : '已完成' }}</h3>
            </div>
            <div style="display: flex;">
              <el-button type="primary" @click="lookDetail(course)" icon="el-icon-view" size="small">查看作业</el-button>
              <el-button type="info" @click="lookSubmitDetail(course)" icon="el-icon-view" size="small"
                style="margin:auto">提交详情</el-button>
              <el-button type="success" @click="openUploadDialog(course)" icon="el-icon-upload"
                size="small">提交作业</el-button>
            </div>
          </div>
        </transition>
        <i v-if="list != undefined && list.length > 0" v-for="count in list.length" :key="count"></i>
      </div>
      <el-row style="text-align: center; margin-bottom: 50px">
        <el-col :span="24">
          <el-button v-if="!isLastPage" type="default" @click="scrollList" :loading="loading"
            style="margin-bottom: 100px">{{ $t("load.loadMore") }}</el-button>
        </el-col>
      </el-row>
    </div>
    <HomeworkModal :initialData="currentData" :visible="showModal" ref="homeworkRef"></HomeworkModal>
    <el-dialog title="提交作业" :visible.sync="uploadDialogVisible" width="50%">
      <div style="display:flex;gap:20px;align-items:center">
        <el-upload ref="upload" action="string" :file-list="imageList" :http-request="handleUpload"
          :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture-card" :disabled="isRead">
          <i class="el-icon-plus">图片</i>
          <!-- <el-button slot="trigger" size="small" type="primary">选取文件</el-button> -->
        </el-upload>
        <el-upload ref="upload" action="string" :http-request="handleUploadAudio" v-loading="loadingAudio"  :disabled="isRead" :before-upload="beforeUploadAudio"
        :show-file-list="false">
          <el-button slot="trigger" size="small" type="primary" :disabled="audioUrl!=''&&isRead">上传语音</el-button>
          <el-button size="small" type="danger" v-if="audioUrl" @click="handleRemoveAudio" :disabled="isRead">删除</el-button>
          <div slot="tip" class="el-upload__tip">仅支持 500MB 以内的 mp3 格式文件，不符合要求请下载“格式工厂”软件压缩转码</div>
          <div class="audio" >
            <audio class="audio-item" ref="audio" controls :src="audioUrl" />
          </div>
        </el-upload>
        <el-upload ref="upload" action="string" v-loading="loadingVideo" :http-request="handleUploadVideo" :before-upload="beforeUploadVideo"
            :show-file-list="false">
          <el-button slot="trigger" size="small" type="primary" :disabled="videoUrl!=''&&isRead">上传视频</el-button>
          <el-button size="small" type="danger" v-if="videoUrl" @click="handleRemoveVideo" :disabled="isRead">删除</el-button>
          <video width="100%" controls="controls" :src="videoUrl"></video>
        </el-upload>
      </div>
      <div>作业总结和说明</div>
      <WangEditor v-model="summary"></WangEditor>
      <el-dialog :visible.sync="dialogVisible" append-to-body>
        <img width="100%" :src="dialogImageUrl" alt="">
      </el-dialog>
      <span slot="footer" class="dialog-footer" v-show="!isRead">
        <el-button @click="uploadDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitWork">提 交</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>

import { homeworkList, homeworkSaveOrUpdate } from "@/api/homework/index";
import { messageWarn, notifyFail } from "@/utils/util";
import HomeworkModal from "./homeworkModal.vue";
import { uploadData } from '@/api/upload-data'
import { schoolStages } from '@/const/grade'
import WangEditor from '@/components/wangEditor/index.vue'
export default {
  components: { HomeworkModal,WangEditor },
  name: "HomeworkIndex",
  watch:
  {
    uploadDialogVisible: {
      handler(val) {
        if (!val) {        
          this.imageList=[],
          this.audioUrl='',
          this.videoUrl='',
          this.summary=''
        }
      }
    }
  },
  data() {
    return {
      showModal: false,
      dialogVisible: false,
      isSuspend: true,
      dialogImageUrl: '',
      currentData: {},
      total: 0,
      loading: true,
      isLastPage: false,
      summary: '',
      query: {
        page: 0,
        size: 10,
        type:'0',
        studentId:this.$store.state.user.userInfo.id,
        stage: null,
        courseName: null,
        date: null,
        grade: null,
        title: null,
        status: null
      },
      isRead: false,
      list: [],
      imageList: [],
      audioUrl: '',
      videoUrl: '',
      loadingAudio: false,
      loadingVideo: false,
      uploadDialogVisible: false, // 控制上传对话框的显示状态
      uploadedFiles: [], // 存储已上传的文件
      stageOptions: [{
        value: '小学',
        label: '小学'
      }, {
        value: '初中',
        label: '初中'
      }, {
        value: '高中',
        label: '高中'
      }
      ],
      gradeOptions: [],
      courseOptions: [],
    };
  },
  created() {
    this.getList();
  },
  methods: {
    changeStage(e) {
      console.log('e', e)
      this.query.grade = null
      this.query.courseName = null
      this.gradeOptions = []
      this.courseOptions = []
      this.gradeOptions = schoolStages.find(item => item.stage === e).grades.map(item => {
        return {
          value: item.yearName,
          label: item.yearName
        }
      })
    },
    changeGrade(e) {
      this.query.courseName = null
      this.courseOptions = []
      this.courseOptions = Object.keys(schoolStages.find(item => item.stage === this.query.stage).grades.find(item => item.yearName === e).courses).map(item => {
        return {
          value: item,
          label: item
        }
      })
      console.log('first', this.courseOptions)
    },
    submitForm() {
      this.query.page = 0;
      this.getList();
    },
    resetForm() {
      this.query.courseName = null;
      this.query.grade = null;
      this.query.title = null;
      this.query.date = null;
      this.query.status = null;
      this.query.stage = null;
      this.getList();
    },
    getList() {
      this.loading = true;

      homeworkList(this.query)
        .then((res) => {
          this.handleListResponse(res.data.data);
        })
        .catch(() => {
          notifyFail(this, this.$t("load.loadFailed"));
          this.loading = false;
        });
    },
    handleListResponse(result) {
      const { totalElements, last, content } = result;
      this.list = content;
      this.total = totalElements;
      this.isLastPage = last;
      this.loading = false;
    },
    scrollList() {
      if (this.isLastPage) {
        messageWarn(this, this.$t("load.noMoreData"));
        return;
      }
      if (this.loading) {
        messageWarn(this, this.$t("load.loading"));
        return;
      }
      this.loading = true;
      setTimeout(() => {
        this.query.page++;
        homeworkList(this.query)
          .then((response) => {
            const { totalElements, last, content } = response.data.data;
            this.updateList(content);
            this.total = totalElements;
            this.isLastPage = last;
            this.loading = false;
          })
          .catch(() => {
            messageWarn(this, this.$t("load.loadFailed"));
            this.loading = false;
          });
      }, 500);
    },
    updateList(list) {
      if (list === undefined || list === null || list.length === 0) {
        return list;
      }
      list.forEach((item) => {
        item.show = false;
      });
      if (this.list.length === 0) {
        this.list = list;
      } else {
        list.forEach((item) => {
          let exist = false;
          for (let i = 0; i < this.list.length; i++) {
            if (this.list[i].id === item.id) {
              exist = true;
            }
          }
          if (!exist) {
            this.list.push(item);
          }
        });
      }
      for (let i = 0; i < list.length; i++) {
        setTimeout(() => {
          list[i].show = true;
        }, 150 + 100 * i);
      }
    },
    lookDetail(data) {
      let newData = { ...data };
      let remark;
      try {
        remark = JSON.parse(data.remark);
        newData.desc = remark.desc;
        newData.dueDate = remark.dueDate;
        newData.imageUrl = remark.imageUrl;
      } catch (err) {
        console.log("err", err);
      }
      this.showModal = true;
      this.currentData = newData;
      this.$refs.homeworkRef.initData(newData);
    },
    lookSubmitDetail(data) {
      this.showModal = false
      if (data.status != "1") {
        this.$message({
          message: this.$t("作业未提交,不能查看"),
          type: "warning",
        });
        return;
      }
      this.isRead = true
      let remark = ''
      try {
        remark = JSON.parse(data.remark)
      } catch (error) {
      }
      this.imageList = remark.imageList
      this.audioUrl = remark.audioUrl
      this.videoUrl = remark.videoUrl
      this.summary = remark.summary
      this.uploadDialogVisible = true
    },
    openUploadDialog(data) {
      this.isRead = false
      if (data.status == "1") {
        this.$message({
          message: this.$t("作业已提交,不能重复提交"),
          type: "warning",
        });
        return;
      }
      this.showModal = false; // 关闭弹窗
      this.uploadDialogVisible = true; // 显示上传对话框
      this.currentData = data; // 传递当前数据
    },
    handleSuccess(response, file) {
      this.uploadedFiles.push(file); // 添加上传的文件到已上传列表
    },
    handleChange(file, fileList) {
      // 可以根据需求处理文件变化（如：验证文件类型和大小）
    },
    beforeUploadAudio(file) {
      this.loadingAudio = true;
      // 文件类型进行判断
      const isAudio = file.name.substring(file.name.length - 3) === "mp3";
      // const isAudio = file.type === "audio/mp3" || file.type === "audio/mpeg";
      // 限制上传文件大小 500M
      const isLt2M = file.size / 1024 / 1024 < 500;
      if (!isAudio) {
        this.$message.error("上传文件只能是Mp3格式!");
        this.loadingAudio = false;
      } else {
        if (!isLt2M) {
          this.$message.error("上传文件大小不能超过 2MB!");
          this.loadingAudio = false;
        } 
      }
      return isAudio && isLt2M 
    },
    downloadFile(file) {
      // 下载文件的逻辑
      const url = "https://jsonplaceholder.typicode.com/posts/" + file.name;
      window.open(url); // 打开下载链接
    },
    submitWork() {
      // 提交作业的逻辑
      let resData = { ...this.currentData };
      let remark = JSON.parse(resData.remark); // 将 remark 解析为对象
      if (this.imageList.length === 0&&this.audioUrl===''&&this.videoUrl==='') {
        messageWarn(this, this.$t("请上传作业文件"));
        return;
      }
      remark.imageList = this.imageList.map(item=>{
        return{
          name:item.attachName,
          url:item.url,
          type:item.attachType
        }
      }) // 将上传的文件添加到 remark 对象中
      remark.audioUrl = this.audioUrl;
      remark.videoUrl = this.videoUrl;
      remark.summary = this.summary;
      resData.remark = JSON.stringify(remark);
      resData.status = "1"; // 作业状态为已提交
      homeworkSaveOrUpdate(resData).then(res => {
        this.$message.success('提交成功')
        this.getList()
      }).catch(err => {
        this.$message.error('提交失败')
      }).finally(() => {
        this.uploadDialogVisible = false; // 关闭对话框
        this.fileList = []; // 清空上传文件列表
      })


      // 进一步处理提交逻辑
    },
    handleUploadAudio(file)
    {
      const formData = new FormData();
      formData.append("file", file.file);
      uploadData(formData).then((resp) => {
        this.audioUrl = resp.data.result.url;
        console.log('first', this.audioUrl)
        this.loadingAudio = false;
      }).catch((e) => {
        this.$message.error(e.message);
        this.loadingAudio = false;
      })
    },
    handleRemoveAudio() {
      this.audioUrl = '';
    },
    handleUpload(file) {
      const formData = new FormData();
      formData.append("file", file.file);
      uploadData(formData).then((resp) => {
        this.imageList.push(resp.data.result);
      }).catch((e) => {
        this.$message.error(e.message);
      })
    },
    beforeUploadVideo(file)
    {
      this.loadingVideo = true;
      const isLt500M = file.size / 1024 / 1024 < 500;
      if (!isLt500M) {
        this.$message.error("上传文件大小不能超过 500MB!");
        this.loadingVideo = false;
      }
      this.loadingVideo = false;
      return isLt500M;
    },
    handleUploadVideo(file)
    {
      const formData = new FormData();
      formData.append("file", file.file);
      uploadData(formData).then((resp) => {
        this.videoUrl = resp.data.result.url;
      }).catch((e) => {
        this.$message.error(e.message);
      })
    },
    handleRemoveVideo()
    {
      this.videoUrl = '';
    },
    handlePreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    handleRemove(file, fileList) {
      this.imageList = fileList;
    },
  },
};
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
.clever-category {
  display: flex;
  width: 100%;
  height: 80px;
  position: relative;
  align-items: center;
  justify-content: center;
  -webkit-box-pack: center;
  z-index: 2;

  h3 {
    text-align: center;
    font-size: 30px;
    text-transform: uppercase;
    letter-spacing: 0.75px;
    color: #3762f0;
    margin-bottom: 0;
  }
}

.clever-category::after {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  content: "";
  background-color: rgba(215, 224, 252, 0.9);
  z-index: -1;
}

.bg-img {
  background-position: center center;
  background-size: cover;
  background-repeat: no-repeat;
}

.course-card-list {
  width: 100%;
  height: auto;
  overflow: auto;
  /* overflow-x: hidden; */
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;

  .single-popular-course {
    width: calc((100% - 120px) / 5);
    box-sizing: border-box;
    margin: 0 12px 12px 0;
    border-radius: 6px;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
    border: 1px solid #ebebeb;

    &:nth-of-type(5n + 0) {
      margin-right: 0;
    }

    .card-item-snapshoot {
      background-origin: border-box;
      background-size: cover;
      background-color: #f0f0f0;
      background-position: 49% 38%;
      display: block;
      border-radius: 6px 6px 0 0;
    }

    .card-item-detail {
      padding: 20px;

      .card-item-name {
        display: -webkit-box;
        overflow: hidden;
      }

      .card-item-course {
        --x-height-multiplier: 0.342;
        --baseline-multiplier: 0.22;
        font-weight: 300;
        font-style: normal;
        letter-spacing: 0;

        .card-item-course-detail {
          color: rgba(0, 0, 0, 0.54);
          fill: rgba(0, 0, 0, 0.54);
        }
      }
    }
  }

  >i {
    width: 30%;
    padding-right: 12px;
  }
}
</style>
