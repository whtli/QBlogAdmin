<template>
  <div>
    <div style="margin: 10px">
      <el-input v-model="roleName" style="width: 200px" placeholder="请输入名称" clearable suffix-icon="el-icon-search"></el-input>
      <el-button class="ml-5" type="primary" @click="loadRoleList">搜索</el-button>
      <el-button type="warning" @click="reset">重置</el-button>
    </div>

    <div style="margin: 10px">
      <el-button type="primary" class="el-icon-circle-plus-outline" @click="addRole">新增</el-button>
    </div>
    <div style="margin: 10px">
      <el-table :data="tableData" border stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="40"></el-table-column>
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="name" label="名称"></el-table-column>
        <el-table-column prop="flag" label="唯一标识"></el-table-column>
        <el-table-column prop="description" label="描述"></el-table-column>
        <el-table-column label="操作" width="280" align="center">
          <template slot-scope="scope">
            <el-button type="info" class="el-icon-menu" @click="changeRight(scope.row)">分配菜单</el-button>
            <el-button type="success" class="el-icon-edit" @click="editRole(scope.row)">编辑</el-button>
            <el-button type="danger" class="el-icon-remove-outline" @click="deleteRole(scope.row.id)">删除</el-button>
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
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </div>

    <el-dialog title="角色信息" :visible.sync="dialogFormVisible" width="30%">
      <el-form label-width="80px" size="small">
        <el-form-item label="名称">
          <el-input v-model="roleForm.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="roleForm.description" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="唯一标识">
          <el-input v-model="roleForm.flag" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveOrUpdateRole">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="菜单分配" :visible.sync="dialogMenuVisible" width="30%">
      <el-tree
        ref="tree"
        :props="props"
        :data="menuList"
        show-checkbox
        node-key="id"
        :default-expand-all="true"
        :default-checked-keys="checks"
      >
        <span slot-scope="{ node, data }" class="custom-tree-node">
          <span :class="data.icon"> {{ data.name }}</span>
        </span>
      </el-tree>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogMenuVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateRoleMenu">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getRoleList, saveOrUpdate, deleteRoleById, updateRoleMenu } from '@/api/system/Role'
import { getMenuList, getMenusByRoleId } from '@/api/system/Menu'

export default {
  name: 'Role',
  data() {
    return {
      tableData: [],
      total: 0,
      pageNum: 1,
      pageSize: 10,
      roleName: '',
      roleForm: {},
      dialogFormVisible: false,
      dialogMenuVisible: false,
      multipleSelection: [],
      menuList: [],
      props: {
        label: 'name'
      },
      checks: [],
      roleId: 0,
      allMenuIds: []
    }
  },
  created() {
    this.loadRoleList()
    this.loadMenuList()
  },
  methods: {
    handleSizeChange(val) {
      // 每页显示的条数
      this.queryInfo.pageSize = val
      this.getBlogList()
      console.log(`每页 ${val} 条`)
    },
    handleCurrentChange(val) {
      // 显示第几页
      this.queryInfo.pageNum = val
      this.getBlogList()
      console.log(`当前页: ${val}`)
    },
    handleSelectionChange(selected) {
      // 获取选中的值
      console.log('选中的值', selected.map((item) => item.id))
      this.multipleSelection = selected
    },
    loadRoleList() {
      const params = {}
      params.roleName = this.roleName
      params.pageNum = this.pageNum
      params.pageSize = this.pageSize
      getRoleList(params).then(res => {
        this.tableData = res.data.data.records
        this.total = res.data.data.total
      })
    },
    loadMenuList() {
      // 获取菜单列表
      getMenuList(this.menuName).then(res => {
        this.menuList = res.data.data.menuList
        this.allMenuIds = res.data.data.allMenuIds
      })
    },
    reset() {
      this.roleName = ''
      this.loadRoleList()
    },
    addRole() {
      this.dialogFormVisible = true
      this.roleForm = {}
    },
    editRole(row) {
      this.roleForm = JSON.parse(JSON.stringify(row))
      this.dialogFormVisible = true
    },
    saveOrUpdateRole() {
      saveOrUpdate(this.roleForm).then(res => {
        this.$message.success('保存成功')
        this.dialogFormVisible = false
        this.loadRoleList()
      }).catch(() => {
        this.$message.error('保存失败')
      })
    },
    deleteRole(id) {
      this.$confirm('此操作将永久删除该角色,是否删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true
      }).then(() => {
        deleteRoleById(id).then(res => {
          this.$message.success('删除成功')
          this.loadRoleList()
        })
      }).catch(() => {
        this.$message.error('删除失败')
      })
    },
    updateRoleMenu() {
      console.log('this.$refs.tree.getCheckedKeys() ========= ')
      console.log(this.$refs.tree.getCheckedKeys())
      const params = {}
      params.roleId = this.roleId
      params.menuIds = this.$refs.tree.getCheckedKeys()
      updateRoleMenu(params).then(res => {
        this.$message.success('绑定成功')
        this.dialogMenuVisible = false
      }).catch(() => {
        this.$message.error('绑定失败')
      })
    },
    changeRight(role) {
      this.roleId = role.id
      // 查询并展示当前角色已有的菜单权限
      getMenusByRoleId(this.roleId).then(res => {
        this.checks = res.data.data
        this.allMenuIds.forEach(id => {
          // 此处的if和else是为了避免出现一级菜单被选中后其下的二级菜单都会被选中的问题
          if (this.checks.includes(id)) {
            this.$nextTick(() => {
              this.$refs.tree.setChecked(id, true)
            })
          } else {
            this.$nextTick(() => {
              this.$refs.tree.setChecked(id, false)
            })
          }
        })
        this.dialogMenuVisible = true
      })
    }
  }
}
</script>

<style scoped>

</style>
