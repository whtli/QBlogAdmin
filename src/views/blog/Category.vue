<template>
  <div style="margin: 10px">
    <!--添加-->
    <el-row :gutter="10" style="margin-left: 10px;">
      <el-col :span="6">
        <el-button type="primary" size="small" icon="el-icon-plus" @click="addDialogVisible=true">添加分类</el-button>
      </el-col>
    </el-row>

    <el-table :data="categoryList" border style="margin: 10px; width: 60%">
      <!-- <el-table-column label="序号" prop="id" />-->
      <el-table-column label="名称" prop="categoryName" width="300"/>
      <el-table-column label="操作">
        <template v-slot="scope">
          <el-button type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row)">编辑</el-button>
          &nbsp;
          <el-popconfirm title="确定删除吗？" icon="el-icon-delete" icon-color="red" @onConfirm="deleteCategoryById(scope.row.id)">
            <el-button slot="reference" type="danger" icon="el-icon-delete">删除</el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!--分页-->
    <div style="padding: 10px 0">
      <el-pagination
        background
        :current-page="queryInfo.pageNum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!--添加分类对话框-->
    <el-dialog title="添加分类" width="30%" :visible.sync="addDialogVisible" :close-on-click-modal="false" @close="addDialogClosed">
      <!--内容主体-->
      <el-form ref="addFormRef" :model="addForm" :rules="formRules" label-width="80px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="addForm.categoryName" />
        </el-form-item>
      </el-form>
      <!--底部-->
      <span slot="footer">
        <el-button @click="addDialogVisible=false">取 消</el-button>
        <el-button type="primary" @click="addCategory">确 定</el-button>
      </span>
    </el-dialog>

    <!--编辑分类对话框-->
    <el-dialog title="编辑分类" width="30%" :visible.sync="editDialogVisible" :close-on-click-modal="false" @close="editDialogClosed">
      <!--内容主体-->
      <el-form ref="editFormRef" :model="editForm" :rules="formRules" label-width="80px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="editForm.categoryName" />
        </el-form-item>
      </el-form>
      <!--底部-->
      <span slot="footer">
        <el-button @click="editDialogVisible=false">取 消</el-button>
        <el-button type="primary" @click="editCategory">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getCategories, addCategory, editCategory, deleteCategoryById } from '@/api/blog/Category'

export default {
  name: 'Category',
  data() {
    return {
      queryInfo: {
        pageNum: 1,
        pageSize: 10
      },
      total: 0,
      categoryList: [],
      addDialogVisible: false,
      editDialogVisible: false,
      addForm: {
        id: '',
        categoryName: ''
      },
      editForm: {},
      formRules: {
        categoryName: [{
          required: true, message: '请输入分类名称', trigger: 'blur'
        }]
      }
    }
  },
  // 页面元素渲染之后再触发
  mounted() {
    // 进入界面后自动刷新统计数据
    this.getCategoryList()
  },
  methods: {
    // 每页显示的条数
    handleSizeChange(val) {
      this.queryInfo.pageSize = val
      this.getCategoryList()
    },
    // 显示第几页
    handleCurrentChange(val) {
      this.queryInfo.pageNum = val
      this.getCategoryList()
    },
    // 获取分类列表
    getCategoryList() {
      getCategories(this.queryInfo).then(res => {
        this.categoryList = res.data.data.pageData.records
        this.total = res.data.data.total
      })
    },
    // 删除指定分类
    deleteCategoryById(id) {
      deleteCategoryById(id).then(res => {
        this.$message.success(res.data.message)
        this.getCategoryList()
      })
    },
    // 新增分类
    addCategory() {
      this.$refs.addFormRef.validate(valid => {
        if (valid) {
          addCategory(this.addForm).then(res => {
            this.$message.success(res.data.message)
            this.addDialogVisible = false
            this.getCategoryList()
          })
        }
      })
    },
    // 关闭新增对话框
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 展示编辑对话框
    showEditDialog(row) {
      // row中没有对象，直接用拓展运算符深拷贝一份（拓展运算符不能深拷贝对象，只能拷贝引用）
      // 如果直接赋值，则为引用，表格上的数据也会随对话框中数据的修改而实时改变
      this.editForm = { ...row }
      this.editDialogVisible = true
    },
    // 编辑分类
    editCategory() {
      this.$refs.editFormRef.validate(valid => {
        if (valid) {
          editCategory(this.editForm).then(res => {
            this.$message.success(res.data.message)
            this.editDialogVisible = false
            this.getCategoryList()
          })
        }
      })
    },
    // 关闭编辑对话框
    editDialogClosed() {
      this.editForm = {}
      this.$refs.editFormRef.resetFields()
    }
  }
}
</script>

<style scoped>

</style>
