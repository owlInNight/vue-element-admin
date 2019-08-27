<template>
  <el-dialog title="添加权限" width="20%" :visible="isShowDialog" @close="hideData()">
    <el-form ref="form" :model="form" label-width="80px">
      <el-form-item label="编码">
        <el-input v-model="form.code" />
      </el-form-item>
      <el-form-item label="角色名称">
        <el-input v-model="form.roleName" />
      </el-form-item>
      <el-form-item label="系统标识">
        <el-input v-model="form.authority" />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="hideData">取 消</el-button>
      <el-button type="primary" @click="confirm">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { addRole } from "@/api/role";

const model = { code: "", roleName: "", authority: "" };

export default {
  name: "ListView",
  props: {
    isShowDialog: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      form: Object.assign({}, model)
    };
  },
  watch: {
    isShowDialog() {
      this.resetTemp();
      this.$nextTick(() => {
        this.$refs["form"].clearValidate();
      });
    }
  },
  methods: {
    hideData() {
      this.$emit("hideDialog");
    },
    resetTemp() {
      this.form = Object.assign({}, model);
    },
    confirm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          addRole(this.form).then(() => {
            this.$notify({
              title: "Success",
              message: "创建成功",
              type: "success",
              duration: 2500
            });
            this.hideData();
          });
        }
      });
    },
    cancel() {
      this.hideData();
    }
  }
};
</script>
