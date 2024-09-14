<template>
  <el-dialog :visible.sync="visible" title="查看作业" width="60%">
    <el-form :model="formData" label-width="120px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="课程名称">
            <el-input v-model="formData.courseName" placeholder="小学语文" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="年级">
            <el-input v-model="formData.grade" placeholder="一年级" readonly />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="作业标题">
            <el-input v-model="formData.title" placeholder="2024.9.3我的作文" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="图片 URL">
            <el-input v-model="formData.imageUrl" placeholder="图片链接" readonly />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="作业日期">
            <el-date-picker v-model="formData.date" type="datetime" placeholder="选择日期时间" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="截止日期">
            <el-date-picker v-model="formData.dueDate" type="datetime" placeholder="选择日期时间" readonly />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item v-if="formData.imageUrl" label="预览">
            <el-image style="width: 100px; height: 100px" :src="formData.imageUrl"
              :preview-src-list="[formData.imageUrl]">
            </el-image>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="学生姓名">
            <el-input v-model="formData.studentName" readonly />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="作业描述">
        <WangEditor v-model="formData.desc"></WangEditor>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
import WangEditor from '@/components/wangEditor/index.vue'
export default {
  components: {
    WangEditor
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      formData: {
        courseName: "",
        grade: "",
        title: "",
        date: "",
        dueDate: "",
        imageUrl: undefined,
        desc: "",
      },
    };
  },
  methods: {
    initData(data) {
      this.formData = data;
    },
  },
};
</script>

<style scoped>
/* 添加你的样式 */
</style>
