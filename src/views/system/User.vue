<template>
  <div>
    <div style="margin: 10px">
      <el-input v-model="username" style="width: 200px" placeholder="请输入名称" clearable suffix-icon="el-icon-search"></el-input>
      <el-button class="ml-5" type="primary" @click="loadUserList">搜索</el-button>
      <el-button type="warning" @click="reset">重置</el-button>
    </div>

    <div style="margin: 10px">
      <el-button type="primary" class="el-icon-circle-plus-outline" @click="addUser">新增</el-button>
    </div>

    <div style="margin: 10px">
      <el-table :data="tableData" border stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="40"></el-table-column>
        <el-table-column prop="id" label="ID" width="40"></el-table-column>
        <el-table-column prop="username" label="用户名" width="80"></el-table-column>
        <el-table-column prop="nickname" label="昵称" width="80"></el-table-column>
        <el-table-column prop="avatar" label="头像地址" width="120"></el-table-column>
        <el-table-column prop="email" label="邮箱" width="120"></el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="120"></el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="120"></el-table-column>
        <el-table-column prop="role" label="角色" width="110"></el-table-column>
        <el-table-column label="操作" width="180" align="left" fixed="right">
          <template slot-scope="scope">
            <el-button type="success" @click="editUser(scope.row)" class="el-icon-edit">编辑</el-button>
            <el-button type="danger" class="el-icon-remove-outline" @click="deleteUser(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div style="padding: 10px 0">
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pageNum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="pageSize"
        layout="total, prev, pager, next"
        :total="total">
      </el-pagination>
    </div>

    <el-dialog title="角色信息" :visible.sync="dialogFormVisible" width="30%">
      <el-form label-width="80px" size="small">
        <el-form-item label="用户名">
          <el-input v-model="userForm.username" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="userForm.nickname" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="头像地址">
          <el-input v-model="userForm.avatar" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="userForm.email" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="userForm.password" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="userForm.role" clearable placeholder="请选择" style="width: 100%">
            <el-option v-for="item in roleList" :key="item.name" :label="item.name" :value="item.flag">
              {{ item.name }}
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveOrUpdateUser">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getUserList, saveOrUpdate, deleteUserById } from '@/api/system/User'
import { getRoleList } from '@/api/system/Role'

export default {
  name: 'User',
  data() {
    return {
      tableData: [],
      total: 0,
      pageNum: 1,
      pageSize: 10,
      username: '',
      userForm: {},
      dialogFormVisible: false,
      multipleSelection: [],
      roleList: []
    }
  },
  created() {
    this.loadUserList()
    this.loadRoleList()
  },
  methods: {
    handleSizeChange(val) {
      // 每页显示的条数
      this.pageSize = val
      this.loadUserList()
      console.log(`每页 ${val} 条`)
    },
    handleCurrentChange(val) {
      // 显示第几页
      this.pageNum = val
      this.loadUserList()
      console.log(`当前页: ${val}`)
    },
    handleSelectionChange(selected) {
      // 获取选中的值
      console.log('选中的值', selected.map((item) => item.id))
      this.multipleSelection = selected
    },
    loadUserList() {
      const params = {}
      params.username = this.username
      params.pageNum = this.pageNum
      params.pageSize = this.pageSize
      getUserList(params).then(res => {
        this.tableData = res.data.records
        this.total = res.data.total
      })
    },
    loadRoleList() {
      // 获取角色列表
      getRoleList(this.menuName).then(res => {
        // this.roleList = res.data.records.map(v => v.flag)
        this.roleList = res.data.records
        console.log(this.roleList)
      })
    },
    reset() {
      this.username = ''
      this.loadUserList()
    },
    addUser() {
      this.dialogFormVisible = true
      this.userForm = {}
    },
    editUser(row) {
      this.userForm = JSON.parse(JSON.stringify(row))
      this.dialogFormVisible = true
    },
    saveOrUpdateUser() {
      saveOrUpdate(this.userForm).then(res => {
        this.$message.success('保存成功')
        this.dialogFormVisible = false
        this.loadUserList()
      }).catch(() => {
        this.$message.error('保存失败')
      })
    },
    deleteUser(id) {
      deleteUserById(id).then(res => {
        this.$message.success('删除成功')
        this.loadUserList()
      }).catch(() => {
        this.$message.error('删除角色失败')
      })
    }
  }
}
</script>

<style scoped>

</style>
