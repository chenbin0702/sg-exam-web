<template>
  <div>
    <div class="content-container">
      <div class="search-form">
        <el-form ref="examForm" :inline="true" :model="query" label-width="100px" class="examForm">
          <el-form-item label="课程" prop="courseName">
            <el-input v-model="query.courseName" autocomplete="off" size="small" />
          </el-form-item>
          <el-form-item label="年级" prop="grade">
            <el-input v-model="query.grade" autocomplete="off" size="small" />
          </el-form-item>
          <el-form-item label="作业标题" prop="title">
            <el-input v-model="query.title" autocomplete="off" size="small" />
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
      <!-- <div class="category-list">
        <ul>
          <li :class="query.activeTag === '1' ? 'active' : ''" @click="changeTag('1')">{{$t('exam.courses.all')}}</li>
          <li :class="query.activeTag === '2' ? 'active' : ''" @click="changeTag('2')">{{$t('exam.courses.latestRelease')}}</li>
          <li :class="query.activeTag === '3' ? 'active' : ''" @click="changeTag('3')">{{$t('fav.myFavorite')}}</li>
        </ul>
      </div> -->
      <div class="course-card-list">
        <transition name="fade-transform" mode="out-in" v-for="course in list" :key="course.id">
          <div class="single-popular-course">
            <img src="https://img0.baidu.com/it/u=918592680,685611776&fm=253&fmt=auto&app=120&f=JPEG?w=607&h=405"
              :alt="course.title" />
            <div class="course-content" style="display: flex; justify-content: center">
              <h3>{{ course.title }}</h3>
            </div>
            <div class="seat-rating-fee d-flex justify-content-between">
              <div class="seat-rating h-100 d-flex align-items-center">
                <div style="display: flex; align-items: center" @click="lookDetail(course)">
                  <i class="el-icon-view" style="color: #3762f0; font-size: 20px"></i>
                  <span style="color: #3762f0; font-size: 14px">查看作业信息</span>
                </div>
              </div>
              <div :class="course.chargeType === 0 ? 'course-fee h-100' : 'course-charge h-100'
          ">
                <a href="#" @click="openUploadDialog(course)">提交作业</a>
              </div>
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
    <el-dialog title="提交作业" :visible.sync="uploadDialogVisible" width="30%">
      <el-upload class="upload-demo" :action="UploadUrl" :on-preview="handlePreview"
        :on-remove="handleRemove" :file-list="fileList" list-type="picture">
        <el-button size="small" type="primary">点击上传</el-button>
        <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
      </el-upload>100%" :src="dialogImageUrl" alt="" />
    </el-dialog>
    <span slot="footer" class="dialog-footer">
      <el-button @click="uploadDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="submitWork">提 交</el-button>
    </span>
    </el-dialog>
  </div>
</template>
<script>
import { homeworkList } from "@/api/homework/index";
import { messageWarn, notifyFail } from "@/utils/util";
import HomeworkModal from "./homeworkModal.vue";
import {UploadUrl} from '@/api/upload-data'
export default {
  components: { HomeworkModal },
  name: "HomeworkIndex",
  data() {
    return {
      showModal: false,
      currentData: {},
      total: 0,
      loading: true,
      isLastPage: false,
      query: {
        page: 0,
        size: 10,
        courseName: null,
        grade: null,
        title: null,
      },
      list: [],
      fileList:[],
      uploadDialogVisible: false, // 控制上传对话框的显示状态
      uploadedFiles: [], // 存储已上传的文件
    };
  },
  created() {
    this.getList();
  },
  methods: {
    submitForm() {
      this.query.page = 0;
      this.getList();
    },
    resetForm() {
      this.query.courseName = null;
      this.query.grade = null;
      this.query.title = null;
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
    openUploadDialog(data) {
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
    downloadFile(file) {
      // 下载文件的逻辑
      const url = "https://jsonplaceholder.typicode.com/posts/" + file.name;
      window.open(url); // 打开下载链接
    },
    submitWork() {
      // 提交作业的逻辑
      console.log("this.uploadFiles", this.uploadedFiles);
      let resData = { ...this.currentData };
      let remark = JSON.parse(resData.remark); // 将 remark 解析为对象
      remark.flies = this.uploadedFiles; // 将上传的文件添加到 remark 对象中
      resData.remark = JSON.stringify(remark);
      resData.status = "1"; // 作业状态为已提交
      console.log("resData", resData);
      this.uploadDialogVisible = false; // 关闭对话框

      // 进一步处理提交逻辑
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
    position: relative;
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
      height: 172px;
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
