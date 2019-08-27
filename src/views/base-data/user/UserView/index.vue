<template>
  <el-dialog width="30%" title="sdfasdfasdf" :visible.sync="isOpen" @close="hideData()">
    <el-form ref="form" class="user-form" :model="formModel" visible label-position="left" label-width="15%" size="small">
      <el-form-item label="姓名" prop="username">
        <el-input v-model="formModel.username" />
      </el-form-item>
      <el-form-item label="代码" prop="code">
        <el-input v-model="formModel.code" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="formModel.password" />
      </el-form-item>
      <el-form-item label="账号" prop="userAccount">
        <el-input v-model="formModel.userAccount" />
      </el-form-item>
      <el-form-item label="账号" prop="enabled">
        <el-radio-group v-model="formModel.enabled" size="medium">
          <el-radio-button :label="true">启用</el-radio-button>
          <el-radio-button :label="false">禁用</el-radio-button>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="hideData">取消</el-button>
      <el-button type="primary" @click="submit">提交</el-button>
    </div>
  </el-dialog>

</template>
<script>
import { createUser } from "@/api/user";
const DEFAULT_DATA = {
  id: undefined,
  username: undefined,
  code: undefined,
  password: "123456",
  userAccount: undefined,
  enabled: true
};
const VIEW_TYPE = {
  CREATE: "CREATE",
  UPDATE: "UPDATE"
};
export default {
  name: "UserView",
  props: {
    dialogFormVisible: {
      require: true,
      default: false,
      type: Boolean
    },
    formData: {
      require: false,
      type: Object,
      default: () => Object.assign({}, DEFAULT_DATA)
    },
    submitType: {
      require: true,
      type: String
    }
  },
  data() {
    return {
      formModel: Object.assign({}, this.formData),
      isOpen: false
    };
  },
  watch: {
    dialogFormVisible(newValue) {
      this.isOpen = newValue;
    }
  },
  methods: {
    resetTemp() {
      this.formModel = Object.assign({}, DEFAULT_DATA);
      this.$nextTick(() => {
        this.$refs["form"].clearValidate();
      });
    },
    hideData() {
      this.resetTemp();
      this.$emit("hideDialog");
    },
    submit() {
      const successBack = response => {
        this.resetTemp();
        this.$emit("submitEnd", response);
      };
      if (this.submitType === VIEW_TYPE.CREATE) {
        this.createSubmit(successBack);
      } else {
        this.updateSubmit(successBack);
      }
    },
    createSubmit(successBack) {
      this.$refs["form"].validate(valid => {
        if (valid) {
          createUser(this.formModel).then(response => {
            successBack(response);
          });
        }
      });
    },
    updateSubmit(successBack) {
      this.$refs["form"].validate(valid => {
        if (valid) {
          const tempData = Object.assign({}, this.formModel);
          createUser(tempData).then(response => {
            successBack(response);
          });
        }
      });
    }
  }
};
</script>
