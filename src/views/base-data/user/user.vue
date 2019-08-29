<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="userNameSearch"
        placeholder="用户名"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-input
        v-model="userCodeSearch"
        placeholder="用户编码"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >添加
      </el-button>
      <el-button
        v-waves
        :loading="downloadLoading"
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleDownload"
      >导出
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column type="index" width="50" />
      <el-table-column label="用户姓名" property="username" />
      <el-table-column label="密码" property="password" />
      <el-table-column label="登陆账号" property="userAccount" />
      <el-table-column label="用户代码" property="code" :show-overflow-tooltip="true" />
      <el-table-column label="电话" property="tel" align="center" />
      <el-table-column label="邮箱" property="email" align="center" min-width="150px" :show-overflow-tooltip="true" />
      <el-table-column label="地址" property="address" min-width="300px" :show-overflow-tooltip="true" />
      <el-table-column label="是否启用" align="center" width="80px">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.enabled" @change="enabledChange(scope.row)" />
          <!--      <el-radio-group v-model="scope.row.enabled" size="mini" >
            <el-radio-button :label="true">启用</el-radio-button>
            <el-radio-button :label="false">禁用</el-radio-button>
          </el-radio-group>-->
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="330">
        <template slot-scope="{ row }">
          <el-button size="mini" type="primary" icon="el-icon-edit" @click="handleUpdate(row)">编辑</el-button>
          <el-button size="mini" type="primary" icon="el-icon-edit" @click="openPermissionDrawer(row)">权限</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteUser(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.size"
      @pagination="getList"
    />
    <UserView
      :form-data="viewData"
      :dialog-form-visible="dialogFormVisible"
      :submit-type="dialogStatus"
      :title="viewTitle"
      @hideDialog="hideDialog"
      @submitEnd="submitEnd"
    />
    <UserPermissionDrawer ref="mission" :show.sync="permissionDrawerShow" @closeDrawler="closeDrawer" />
  </div>
</template>

<script>
import { createUser, deleteUser, page } from "@/api/user";
import UserView from "./UserView";
import waves from "@/directive/waves"; // waves directive
import { parseTime } from "@/utils";
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination
import UserPermissionDrawer from "./UserPermissionDrawer"
// 表单验证规则
const VIEW_TYPE = {
  CREATE: "CREATE",
  UPDATE: "UPDATE"
};
const methods = {
  openPermissionDrawer(row) {
    this.permissionDrawerShow = true
    this.$refs['mission'].$props['user'] = row;
  },
  closeDrawer() {
    this.permissionDrawerShow = false
  },
  enabledChange(row) {
    const temp = Object.assign({}, row);
    createUser(temp).then(() => {
      this.$message({
        title: "成功",
        message: `用户${temp.username}成功设置为${temp.enabled ? "启用" : "禁用"}状态`,
        type: "success", center: true
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
    this.viewTitle = '创建用户';
    this.dialogFormVisible = true;
  },
  handleUpdate(row) {
    this.viewData = Object.assign({}, row);
    this.dialogStatus = VIEW_TYPE.UPDATE;
    this.viewTitle = '更新用户';
    this.dialogFormVisible = true;
  },
  submitEnd() {
    this.dialogFormVisible = false;
    this.listQuery.page = 0;
    this.getList();
    this.$notify({ title: "操作成功", message: `操作成功!`, type: "success", duration: 2000 });
  },
  deleteUser(row) {
    this.$confirm(`确定要删除用户${row.username}吗?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      deleteUser(row.id).then(() => {
        this.getList();
        this.$message({
          message: '删除成功',
          type: 'success',
          center: true
        });
      })
    });
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

export default {
  name: "User",
  components: { Pagination, UserView, UserPermissionDrawer },
  directives: { waves },
  data() {
    return {
      viewData: undefined,
      tableKey: 0,
      list: null,
      viewTitle: "",
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
      downloadLoading: false,
      permissionDrawerShow: false
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
