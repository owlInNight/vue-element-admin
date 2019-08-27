<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input placeholder="Title" class="filter-item" style="width: 50%;" />

      <el-button class="filter-item" type="primary" icon="el-icon-search">
        查询
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="showView">
        添加
      </el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-download">
        导出
      </el-button>
    </div>
    <el-table :key="tableKey" v-loading="listLoading" :data="list" border fit highlight-current-row stripe style="width: 100%;">
      <el-table-column type="index" width="50" />
      <el-table-column label="角色名称" prop="roleName" />
      <el-table-column label="角色编码" prop="code" />
      <el-table-column label="角色标记" prop="authority">
        <template slot-scope="scope">
          <el-tag type="success" close-transition>{{ scope.row.authority }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建人" prop="createUser" />
      <el-table-column label="创建时间" prop="createTime" />
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getList" />

    <ListView :is-show-dialog="visibleView" @hideDialog="hideView" />
    <!-- <pagination /> -->
  </div>
</template>
<script>
import ListView from "./ListView";
import { rolePage } from "@/api/role";
import Pagination from "@/components/Pagination";
export default {
  name: "RoleList",
  components: { Pagination, ListView },
  data() {
    return {
      tableKey: 0,
      list: null,
      visibleView: false,
      listLoading: true,
      total: 0,
      listQuery: {
        // 分页查询参数
        page: 0, // 第几页
        size: 20 // 分页
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    showView() {
      this.visibleView = true;
    },
    hideView() {
      this.visibleView = false;
      this.getList();
    },
    getList() {
      this.listLoading = true;
      rolePage(this.listQuery).then(response => {
        console.log(response);
        const { content, totalElements } = response.data;
        this.total = totalElements;
        this.list = content;
        this.listLoading = false;
      });
    }
  }
};
</script>
