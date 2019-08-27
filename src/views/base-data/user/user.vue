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
        <template slot-scope="scope">{{ scope.row.username }} </template>
      </el-table-column>
      <el-table-column label="密码" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          {{ scope.row.password }}
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
          {{ scope.row.userAccount }}
        </template>
      </el-table-column>
      <el-table-column label="用户代码" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          {{ scope.row.code }}
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{ row }">
          <el-button size="mini" type="primary" @click="handleUpdate(row)">编辑</el-button>
          <el-button size="mini" type="danger">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getList" />
    <!-- 封装成模块的模式 -->
    <UserView :data="viewData" :dialog-form-visible="dialogFormVisible" :submit-type="dialogStatus" @hideDialog="hideDialog" @submitEnd="submitEnd" />
  </div>
</template>

<script>
import { page, createUser } from "@/api/user";
import UserView from "./UserView";
import waves from "@/directive/waves"; // waves directive
import { parseTime } from "@/utils";
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination

// 表单验证规则
const rules = {
  username: [{ required: true, message: "用户名不可为空", trigger: "change" }]
};
const VIEW_TYPE = {
  CREATE: "CREATE",
  UPDATE: "UPDATE"
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
      const { content, totalElements } = response.data;
      this.list = content;
      this.total = totalElements;
      this.listLoading = false;
    });
  },
  handleFilter() {
    this.listQuery.page = 0;
    this.getList();
  },
  handleCreate() {
    this.dialogStatus = VIEW_TYPE.CREATE;
    this.dialogFormVisible = true;
  },
  handleUpdate(row) {
    this.viewData = Object.assign({}, row);
    this.dialogStatus = VIEW_TYPE.UPDATE;
    this.dialogFormVisible = true;
  },
  submitEnd(result) {
    this.dialogFormVisible = false;
    this.listQuery.page = 0;
    this.getList();
  },
  hideDialog() {
    this.dialogFormVisible = false;
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
  name: "User",
  components: { Pagination, UserView },
  directives: { waves },
  filters,
  data() {
    return {
      viewData: undefined,
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 0,
        size: 5,
        username: undefined,
        enable: undefined,
        code: undefined
      },
      dialogFormVisible: false,
      dialogStatus: "",
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
