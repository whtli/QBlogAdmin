<template>
  <div>
    <div style="margin: 10px">
      <el-input v-model="menuName" style="width: 200px" placeholder="请输入名称" clearable suffix-icon="el-icon-search"></el-input>
      <el-button class="ml-5" type="primary" @click="loadMenuList">搜索</el-button>
      <el-button type="warning" @click="reset">重置</el-button>
    </div>
    <div style="margin: 10px">
      <el-button type="primary" class="el-icon-circle-plus-outline" @click="addMenu(null)">新增一级菜单</el-button>
    </div>

    <div style="margin: 10px">
      <el-table
        :data="tableData"
        border
        stripe
        row-key="id"
        default-expand-all>
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="name" label="名称"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column prop="component" label="组件"></el-table-column>
        <el-table-column label="图标">
          <template slot-scope="scope">
            <span :class="scope.row.icon"></span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述"></el-table-column>
        <el-table-column prop="sortNum" label="顺序"></el-table-column>
        <el-table-column label="操作" width="300" fixed="right">
          <template slot-scope="scope">
            <el-button type="success" class="el-icon-edit" @click="editMenu(scope.row)">编辑</el-button>
            <el-button type="danger" class="el-icon-remove-outline" @click="deleteMenu(scope.row.id)" v-if="scope.row.children === null || scope.row.children.length === 0">删除</el-button>
            <el-button type="primary" class="el-icon-plus" @click="addMenu(scope.row.id)" v-if="!scope.row.pid && !scope.row.component"  >新增二级菜单</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog title="菜单信息" :visible.sync="dialogFormVisible" width="30%">
      <el-form label-width="80px" size="small">
        <el-form-item label="名称">
          <el-input v-model="menuForm.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="路径">
          <el-input v-model="menuForm.path" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="组件">
          <el-input v-model="menuForm.component" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="图标">
          <el-select v-model="menuForm.icon" clearable placeholder="请选择" style="width: 100%">
            <el-option v-for="item in options" :key="item.name" :label="item.name" :value="item.value">
              <i :class="item.value"></i> {{ item.name }}
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="顺序">
          <el-input v-model="menuForm.sortNum" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="menuForm.description" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveOrUpdateMenu">确 定</el-button>
      </div>
    </el-dialog>

    <div style="padding: 10px">
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
  </div>
</template>

<script>
import { getMenuList, getIconList, saveOrUpdate, deleteMenuById } from '@/api/system/Menu'

export default {
  name: 'Menu',
  data() {
    return {
      tableData: [],
      total: 0,
      pageNum: 1,
      pageSize: 10,
      menuName: '',
      menuForm: {},
      dialogFormVisible: false,
      multipleSelection: [],
      options: []
    }
  },
  created() {
    this.loadMenuList()
    this.loadIcons()
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
    loadMenuList() {
      // 获取菜单列表
      getMenuList(this.menuName).then(res => {
        this.tableData = res.data.data.menuList
        this.total = res.data.data.total
      })
    },
    loadIcons() {
      // 获取图标信息
      getIconList().then(res => {
        this.options = res.data.data
      })
    },
    reset() {
      this.menuName = ''
      this.loadMenuList()
    },
    addMenu(pid) {
      this.dialogFormVisible = true
      this.menuForm = {}
      if (pid) {
        this.menuForm.pid = pid
      }
    },
    editMenu(row) {
      this.menuForm = JSON.parse(JSON.stringify(row))
      this.dialogFormVisible = true
    },
    saveOrUpdateMenu() {
      saveOrUpdate(this.menuForm).then(res => {
        this.$message.success('保存成功')
        this.dialogFormVisible = false
        this.loadMenuList()
      }).catch(() => {
        this.$message.error('保存失败')
      })
    },
    deleteMenu(id) {
      this.$confirm('此操作将永久删除该菜单,是否删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true
      }).then(() => {
        deleteMenuById(id).then(res => {
          this.$message.success('删除成功')
          this.loadMenuList()
        })
      }).catch(() => {
        this.$message.error('删除失败')
      })
    }
  }
}
</script>

<style>
  .fontSize18 {
    font-size: 18px;
  }

  .fontSize12 {
    font-size: 12px;
  }
</style>
