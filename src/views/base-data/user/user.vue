<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.username"
        placeholder="用户名"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-input
        v-model="listQuery.code"
        placeholder="用户编码"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >查询</el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >添加</el-button>
      <el-button
        v-waves
        :loading="downloadLoading"
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleDownload"
      >导出</el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
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
      <el-table-column label="是否启用" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <span>{{ scope.row.enabled }}</span>
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

      <el-table-column
        label="Actions"
        align="center"
        width="230"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">编辑</el-button>
          <el-button
            v-if="row.status!='deleted'"
            size="mini"
            type="danger"
            @click="handleModifyStatus(row,'deleted')"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <el-dialog width="30%" :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        class="user-form"
        :rules="rules"
        :model="temp"
        visible
        label-position="left"
        label-width="10%"
        size="small"
      >
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
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">提交</el-button>
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
import {
  // fetchList,
  fetchPv,
  // createArticle,
  updateArticle
} from "@/api/article";
import { page, createUser } from "@/api/user";
import waves from "@/directive/waves"; // waves directive
import { parseTime } from "@/utils";
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination

const calendarTypeOptions = [
  { key: "CN", display_name: "China" },
  { key: "US", display_name: "USA" },
  { key: "JP", display_name: "Japan" },
  { key: "EU", display_name: "Eurozone" }
];

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name;
  return acc;
}, {});
// 表单验证规则
const rules = {
  username: [{ required: true, message: "用户名不可为空", trigger: "change" }],
  timestamp: [
    {
      type: "date",
      required: true,
      message: "timestamp is required",
      trigger: "change"
    }
  ],
  title: [{ required: true, message: "title is required", trigger: "blur" }]
};

const methods = {
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
  handleModifyStatus(row, status) {
    this.$message({
      message: "操作Success",
      type: "success"
    });
    row.status = status;
  },
  sortChange(data) {
    const { prop, order } = data;
    if (prop === "id") {
      this.sortByID(order);
    }
  },
  sortByID(order) {
    if (order === "ascending") {
      this.listQuery.sort = "+id";
    } else {
      this.listQuery.sort = "-id";
    }
    this.handleFilter();
  },
  resetTemp() {
    this.temp = {
      id: undefined,
      importance: 1,
      remark: "",
      timestamp: new Date(),
      title: "",
      status: "published",
      type: ""
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
        this.temp.id = parseInt(Math.random() * 100) + 1024; // mock a id
        this.temp.author = "vue-element-admin";
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
    this.temp.timestamp = new Date(this.temp.timestamp);
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
        tempData.timestamp = +new Date(tempData.timestamp); // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
        updateArticle(tempData).then(() => {
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
  handleDelete(row) {
    this.$notify({
      title: "Success",
      message: "Delete Successfully",
      type: "success",
      duration: 2000
    });
    const index = this.list.indexOf(row);
    this.list.splice(index, 1);
  },
  handleFetchPv(pv) {
    fetchPv(pv).then(response => {
      this.pvData = response.data.pvData;
      this.dialogPvVisible = true;
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
  },
  getSortClass: function(key) {
    const sort = this.listQuery.sort;
    return sort === `+${key}`
      ? "ascending"
      : sort === `-${key}`
        ? "descending"
        : "";
  }
};
export default {
  name: "ComplexTable",
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: "success",
        draft: "info",
        deleted: "danger"
      };
      return statusMap[status];
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type];
    }
  },
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
        code: undefined,
        sort: "+id"
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [
        { label: "ID Ascending", key: "+id" },
        { label: "ID Descending", key: "-id" }
      ],
      statusOptions: ["published", "draft", "deleted"],
      showReviewer: false,
      temp: {
        id: undefined,
        username: 1,
        code: undefined,
        password: 123456,
        userAccount: undefined
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
