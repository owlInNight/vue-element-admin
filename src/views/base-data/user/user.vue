<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="userNameSearch" placeholder="用户名" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="userCodeSearch" placeholder="用户编码" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">添加</el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">导出</el-button>
    </div>

    <el-table :key="tableKey" v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%;">
      <el-table-column type="index" width="50" />
      <el-table-column label="用户姓名" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <span>{{ scope.row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="密码" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <span>{{ scope.row.password }}</span>
        </template>
      </el-table-column>
      <el-table-column label="是否启用" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-radio-group v-model="scope.row.enabled" size="mini" @change="enabledChange(scope.row)">
            <el-radio-button :label="true">启用</el-radio-button>
            <el-radio-button :label="false">禁用</el-radio-button>
          </el-radio-group>
        </template>
      </el-table-column>
      <el-table-column label="登陆账号" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <span>{{ scope.row.userAccount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户代码" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <span>{{ scope.row.code }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{ row }">
          <el-button size="mini" type="primary" @click="handleUpdate(row)">编辑</el-button>
          <el-button size="mini" type="danger">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
    <!-- 封装成模块的模式 -->
    <el-dialog width="30%" :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" class="user-form" :rules="rules" :model="temp" visible label-position="left" label-width="15%" size="small">
        <el-form-item label="姓名" prop="username">
          <el-input v-model="temp.username" />
        </el-form-item>
        <el-form-item label="代码" prop="code">
          <el-input v-model="temp.code" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="temp.password" />
        </el-form-item>
        <el-form-item label="账号" prop="userAccount">
          <el-input v-model="temp.userAccount" />
        </el-form-item>
        <el-form-item label="账号" prop="userAccount">
          <el-radio-group v-model="temp.enabled" size="medium">
            <el-radio-button :label="true">启用</el-radio-button>
            <el-radio-button :label="false">禁用</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">提交</el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { page, createUser } from "@/api/user";
import waves from "@/directive/waves"; // waves directive
import { parseTime } from "@/utils";
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination

// 表单验证规则
const rules = {
  username: [{ required: true, message: "用户名不可为空", trigger: "change" }]
};

const methods = {
  enabledChange(row) {
    const temp = Object.assign({}, row);
    createUser(temp).then(resp => {
      this.$notify({
        title: "成功",
        message: `用户${temp.username}成功设置为${
          temp.enabled ? "启用" : "禁用"
        }状态`,
        type: "success",
        duration: 2000
      });
    });
  },
  getList() {
    this.listLoading = true;
    page(this.listQuery).then(response => {
      console.log(response);
      const { content, totalElements } = response.data;
      this.list = content;
      this.total = totalElements;
      this.listLoading = false;
    });
  },
  handleFilter() {
    this.listQuery.page = 1;
    this.getList();
  },
  resetTemp() {
    this.temp = {
      id: undefined,
      username: undefined,
      code: undefined,
      password: "123456",
      userAccount: undefined,
      enabled: true
    };
  },
  handleCreate() {
    this.resetTemp();
    this.dialogStatus = "create";
    this.dialogFormVisible = true;
    this.$nextTick(() => {
      this.$refs["dataForm"].clearValidate();
    });
  },
  createData() {
    this.$refs["dataForm"].validate(valid => {
      if (valid) {
        createUser(this.temp).then(() => {
          this.list.unshift(this.temp);
          this.dialogFormVisible = false;
          this.getList();
          this.$notify({
            title: "成功",
            message: "创建成功",
            type: "success",
            duration: 2000
          });
        });
      }
    });
  },
  handleUpdate(row) {
    this.temp = Object.assign({}, row); // copy obj
    this.dialogStatus = "update";
    this.dialogFormVisible = true;
    this.$nextTick(() => {
      this.$refs["dataForm"].clearValidate();
    });
  },
  updateData() {
    this.$refs["dataForm"].validate(valid => {
      if (valid) {
        const tempData = Object.assign({}, this.temp);
        createUser(tempData).then(() => {
          for (const v of this.list) {
            if (v.id === this.temp.id) {
              const index = this.list.indexOf(v);
              this.list.splice(index, 1, this.temp);
              break;
            }
          }
          this.dialogFormVisible = false;
          this.$notify({
            title: "Success",
            message: "Update Successfully",
            type: "success",
            duration: 2000
          });
        });
      }
    });
  },
  handleDownload() {
    this.downloadLoading = true;
    import("@/vendor/Export2Excel").then(excel => {
      const tHeader = ["timestamp", "title", "type", "importance", "status"];
      const filterVal = ["timestamp", "title", "type", "importance", "status"];
      const data = this.formatJson(filterVal, this.list);
      excel.export_json_to_excel({
        header: tHeader,
        data,
        filename: "table-list"
      });
      this.downloadLoading = false;
    });
  },
  formatJson(filterVal, jsonData) {
    return jsonData.map(v =>
      filterVal.map(j => {
        if (j === "timestamp") {
          return parseTime(v[j]);
        } else {
          return v[j];
        }
      })
    );
  }
};
const filters = {
  enableFilter(enable) {
    return enable ? "启用" : "禁用";
  }
};
export default {
  name: "ComplexTable",
  components: { Pagination },
  directives: { waves },
  filters,
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        username: undefined,
        enable: undefined,
        code: undefined
      },
      temp: {
        id: undefined,
        username: 1,
        code: undefined,
        password: "123456",
        userAccount: undefined,
        enabled: true
      },
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "修改",
        create: "新增"
      },
      dialogPvVisible: false,
      pvData: [],
      rules,
      downloadLoading: false
    };
  },
  computed: {
    userNameSearch: {
      get() {
        return this.listQuery.username;
      },
      set(val) {
        console.log(val, this.listQuery);
        if (val && val.trim()) {
          this.listQuery.username = val;
        } else {
          this.listQuery.username = undefined;
        }
      }
    },
    userCodeSearch: {
      get() {
        return this.listQuery.code;
      },
      set(val) {
        if (val && val.trim()) {
          this.listQuery.code = val;
        } else {
          this.listQuery.code = undefined;
        }
      }
    }
  },
  created() {
    this.getList();
  },
  methods
};
</script>
<style  scoped>
.user-form {
  margin: 0 5%;
}
</style>
