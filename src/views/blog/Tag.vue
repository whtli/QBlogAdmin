<template>
  <div style="margin: 10px">
    <!--添加-->
    <el-row :gutter="10" style="margin-left: 10px;">
      <el-col :span="6">
        <el-button type="primary" size="small" icon="el-icon-plus" @click="addDialogVisible=true">添加标签</el-button>
      </el-col>
    </el-row>

    <el-table :data="tagList" border style="margin: 10px; width: 100%">
<!--      <el-table-column label="序号" type="index" width="50"></el-table-column>-->
      <el-table-column label="名称" prop="tagName"></el-table-column>
      <el-table-column label="颜色">
        <template v-slot="scope">
          <span style="float:left;width: 100px;">{{ scope.row.color }}</span>
          <span style="float:left;width: 100px; height: 23px" :class="`me-${scope.row.color}`"></span>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template v-slot="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row)">编辑</el-button>
          &nbsp;
          <el-popconfirm title="确定删除吗？" icon="el-icon-delete" iconColor="red" @onConfirm="deleteTagById(scope.row.id)">
            <el-button size="mini" type="danger" icon="el-icon-delete" slot="reference">删除</el-button>
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

    <!--添加标签对话框-->
    <el-dialog title="添加标签" width="30%" :visible.sync="addDialogVisible" :close-on-click-modal="false" @close="addDialogClosed">
      <!--内容主体-->
      <el-form ref="addFormRef" :model="addForm" :rules="formRules" label-width="80px">
        <el-form-item label="标签名称" prop="name">
          <el-input v-model="addForm.tagName" />
        </el-form-item>
        <el-form-item label="标签颜色">
          <el-select v-model="addForm.color" placeholder="请选择颜色" :clearable="true" style="width: 100%">
            <el-option v-for="item in colors" :key="item.value" :label="item.label" :value="item.value">
              <span style="float: left; width: 100px;">{{ item.label }}</span>
              <span style="float: left; width: 100px; height: inherit" :class="`me-${item.value}`"></span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ item.value }}</span>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <!--底部-->
      <span slot="footer">
        <el-button @click="addDialogVisible=false">取 消</el-button>
        <el-button type="primary" @click="addTag">确 定</el-button>
      </span>
    </el-dialog>

    <!--编辑标签对话框-->
    <el-dialog title="编辑标签" width="30%" :visible.sync="editDialogVisible" :close-on-click-modal="false" @close="editDialogClosed">
      <!--内容主体-->
      <el-form ref="editFormRef" :model="editForm" :rules="formRules" label-width="80px">
        <el-form-item label="标签名称" prop="name">
          <el-input v-model="editForm.tagName" />
        </el-form-item>
        <el-form-item label="标签颜色" prop="color">
          <el-select v-model="editForm.color" placeholder="请选择颜色" :clearable="true" style="width: 100%">
            <el-option v-for="item in colors" :key="item.value" :label="item.label" :value="item.value">
              <span style="float: left; width: 100px;">{{ item.label }}</span>
              <span style="float: left; width: 100px; height: inherit" :class="`me-${item.value}`"></span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ item.value }}</span>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <!--底部-->
      <span slot="footer">
        <el-button @click="editDialogVisible=false">取 消</el-button>
        <el-button type="primary" @click="editTag">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { addTag, deleteTagById, editTag, getTags } from '@/api/blog/Tag'

export default {
  name: 'Tag',
  data() {
    return {
      queryInfo: {
        pageNum: 1,
        pageSize: 10
      },
      total: 0,
      tagList: [],
      addDialogVisible: false,
      editDialogVisible: false,
      addForm: {
        id: '',
        tagName: '',
        color: ''
      },
      editForm: {},
      formRules: {
        tagName: [{
          required: true, message: '请输入标签名称', trigger: 'blur'
        }]
      },
      colors: [
        { label: '红色', value: 'red' },
        { label: '橘黄', value: 'orange' },
        { label: '黄色', value: 'yellow' },
        { label: '橄榄绿', value: 'olive' },
        { label: '纯绿', value: 'green' },
        { label: '水鸭蓝', value: 'teal' },
        { label: '纯蓝', value: 'blue' },
        { label: '紫罗兰', value: 'violet' },
        { label: '紫色', value: 'purple' },
        { label: '粉红', value: 'pink' },
        { label: '棕色', value: 'brown' },
        { label: '灰色', value: 'grey' },
        { label: '黑色', value: 'black' }
      ]
    }
  },
  // 页面元素渲染之后再触发
  mounted() {
    // 进入界面后自动刷新统计数据
    this.getTagList()
  },
  methods: {
    // 每页显示的条数
    handleSizeChange(val) {
      this.queryInfo.pageSize = val
      this.getTagList()
    },
    // 显示第几页
    handleCurrentChange(val) {
      this.queryInfo.pageNum = val
      this.getTagList()
    },
    // 获取分类列表
    getTagList() {
      getTags(this.queryInfo).then(res => {
        this.tagList = res.data.pageData.records
        this.total = res.data.total
      })
    },
    // 删除指定分类
    deleteTagById(id) {
      deleteTagById(id).then(res => {
        this.$message.success(res.data.message)
        this.getTagList()
      })
    },
    // 新增分类
    addTag() {
      this.$refs.addFormRef.validate(valid => {
        if (valid) {
          addTag(this.addForm).then(res => {
            this.$message.success(res.data.message)
            this.addDialogVisible = false
            this.getTagList()
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
    editTag() {
      this.$refs.editFormRef.validate(valid => {
        if (valid) {
          editTag(this.editForm).then(res => {
            this.$message.success(res.data.message)
            this.editDialogVisible = false
            this.getTagList()
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
.me-red {
  background: #DD3C3C;
}

.me-orange {
  background: #F27E31;
}

.me-yellow {
  background: #FAC21F;
}

.me-olive {
  background: #BBCF2D;
}

.me-green {
  background: #36BF56;
}

.me-teal {
  background: #18BBB3;
}

.me-blue {
  background: #368FD3;
}

.me-violet {
  background: #7248CD;
}

.me-purple {
  background: #AB46CC;
}

.me-pink {
  background: #E14BA0;
}

.me-brown {
  background: #AC7551;
}

.me-grey {
  background: #828282;
}

.me-black {
  background: #303132;
}
</style>
