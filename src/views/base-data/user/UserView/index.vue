<template>
  <el-dialog width="50%" :title="title" :visible.sync="isOpen" @close="hideData()">
    <el-form
      ref="form"
      class="user-form"
      :model="formModel"
      :rules="rules"
      visible
      size="small"
      label-position="right"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="姓名" prop="username">
            <el-input v-model="formModel.username" maxlength="30" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="代码" prop="code">
            <el-input v-model="formModel.code" maxlength="10" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="密码" prop="password">
            <el-input v-model="formModel.password" maxlength="30" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="账号" prop="userAccount">
            <el-input v-model="formModel.userAccount" maxlength="30" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="电话号码" prop="tel">
            <el-input v-model="formModel.tel" maxlength="30" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="e-mail" prop="email">
            <el-input v-model="formModel.email" maxlength="100" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="地址" prop="address">
            <el-input v-model="formModel.address" maxlength="255" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item prop="enabled">
            <el-switch v-model="formModel.enabled" active-text="启用" inactive-text="禁用" />
          </el-form-item>
        </el-col>
      </el-row>

    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="hideData">取消</el-button>
      <el-button type="primary" @click="submit">提交</el-button>
    </div>
  </el-dialog>

</template>
<script>
import { createUser, getUser } from "@/api/user";

const DEFAULT_DATA = {
  id: undefined,
  username: undefined,
  code: undefined,
  password: "123456",
  userAccount: undefined,
  enabled: true,
  tel: undefined,
  email: undefined,
  address: undefined
};
const VIEW_TYPE = {
  CREATE: "CREATE",
  UPDATE: "UPDATE"
};
const validPhone = (rule, value, callback) => {
  const reg = /^1[3|4|5|7|8][0-9]\d{8}$/g;
  if (!value) {
    callback()
  } else  if (!reg.test(value)) {
    callback(new Error('请输入正确的11位手机号码'))
  } else {
    callback()
  }
};
const checkEmail = (rule, value, callback) => {
  const mailReg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/g
  if (!value) {
    return callback()
  }
  if (mailReg.test(value)) {
    callback()
  } else {
    callback(new Error('请输入正确的邮箱格式'))
  }
}

export default {
  name: "UserView",
  props: {
    dialogFormVisible: { require: true, default: false, type: Boolean },
    formData: { require: false, type: Object, default: () => Object.assign({}, DEFAULT_DATA) },
    submitType: { require: true, type: String, default: VIEW_TYPE.CREATE },
    title: { require: true, type: String, default: "" }
  },
  data() {
    const validCode = (rule, value, callback) => {
      getUser({ code: value }).then(reps => {
        if (reps.data && reps.data.length > 0) {
          const { data } = reps;
          const error = new Error("编码重复");
          if (this.formData.id) {
            for (const i of data) {
              if (i.id === this.formData.id) {
                callback();
              }
            }
            callback(error);
          } else {
            return callback(error);
          }
        } else {
          callback();
        }
      })
    };
    return {
      formModel: Object.assign({}, this.formData),
      isOpen: false,
      rules: {
        username: [
          { required: true, message: '必填字段', trigger: 'blur' },
          { min: 2, max: 30, message: '最少三个字符 2 到 30 个字符', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '必填字段', trigger: 'blur' },
          { validator: validCode, trigger: 'blur' }
        ],
        tel: [
          { validator: validPhone, trigger: 'blur' }
        ], email: [
          { validator: checkEmail, trigger: 'blur' }
        ]
      }
    };
  },
  watch: {
    dialogFormVisible(newValue) {
      this.isOpen = newValue;
    },
    formData(newValue) {
      this.formModel = newValue;
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
