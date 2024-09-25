// 导入 mysql 模块
// const mysql = require('mysql');
const mysql = require('mysql2');

// 创建数据库连接对象
const db = mysql.createPool({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: 'root',
    database: 'code_start_blog'
})

module.exports = db;