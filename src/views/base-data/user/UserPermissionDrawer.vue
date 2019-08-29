<template>
  <el-drawer
    class="tag-split"
    title="权限配置"
    size="50%"
    :visible.sync="drawer"
    :close-on-press-escape="false"
    :destroy-on-close="true"
    direction="ttb"
    :before-close="handleClose"
    @open="drawerOpen"
  >

    <el-row v-for="(tag , index) in getTagGroups()" :key="index" :gutter="20">
      <el-col v-for="(element,eleIndex) in tag" :key="eleIndex" :span="2">
        <el-checkbox :key="element.id" v-model="element.isCheck" :label="element.roleName" border @change="setCheck(element)" />
      </el-col>
    </el-row>

  </el-drawer>

</template>

<script>
import { getRoles } from  "@/api/role"
export default {
  name: 'UserPermissionDrawer',
  props: {
    show: {
      required: true,
      type: Boolean
    },
    user: {
      type: Object,
      default: undefined
    }
  },
  data() {
    return {
      drawer: false,
      colNumber: 12, // 一行几个
      tags: []
    }
  },
  watch: {
    show(newValue) {
      this.drawer = newValue;
    },
    user(newValue) {
      this.tags = newValue
    }
  }, /*
  created() {
    this.getTags();
  },*/
  methods: {
    handleClose() {
      this.$emit('closeDrawler');
    },
    drawerOpen() {
      this.getTags();
    },
    getTags() {
      getRoles().then(reps => {
        console.log(reps);
        this.tags = reps.data;
      });
    },
    setCheck(role) {
      console.log(role)
    },
    getTagGroups() {
      const groups = [];
      let tempGroup = [];
      for (let i = 0; i < this.tags.length; i++) {
        const  tg = Object.assign({}, this.tags[i]);
        tg.index = i;
        tg.isCheck = false;
        tempGroup.push(tg);
        if (i !== 0 && i >= this.colNumber && i % this.colNumber  === 0) {
          groups.push(tempGroup);
          tempGroup = []
        }
      }
      groups.push(tempGroup);
      return groups;
    }
  }
}
</script>
<style scoped>
  .el-row .el-checkbox{
    width: 100%;
  }
  .el-drawer .el-row{
    margin-top: 20px;
    margin-left: 20px;
    margin-right: 20px;
  }
  .el-drawer .el-row:first-child{
    margin-top: 0;
  }

</style>
