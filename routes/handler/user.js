// exports === module.exports
// 导入数据库连接对象
const db = require("../../db/index");
// 导入密码加密工具
const bcrypt = require("bcryptjs");
// 导入用户数据验证规则对象
const { reg_login_schema } = require("../../schema/user");
// 用户注册处理函数
exports.register = (req, res) => {
    // 接收表单数据
    const userInfo = req.body;
    // 判断数据是否合法
    const { error } = reg_login_schema.validate(userInfo);
    if (error) return res.cc(error);
    // 查询用户名是否被占用
    const sqlStr = "select * from user where username=?";
    db.query(sqlStr, userInfo.username, (err, results) => {
        // 执行 SQL 语句失败
        if (err) return res.cc(err);
        // 判断用户名是否被占用
        if (results.length > 0){
            return res.cc("用户名被占用，请更换其他用户名");
        }
        // 对密码进行加密
        userInfo.password = bcrypt.hashSync(userInfo.password, 10);
        // 执行 SQL 语句，插入新用户
        const sql = "insert into user set ?";
        db.query(
            sql, 
            {username: userInfo.username, password: userInfo.password, email: userInfo.email, role: "user"}, 
            (err, results)=> {
                // 判断 sql 语句是否执行失败
                if (err) return res.cc(err);
                // 判断影响行数是否为 1
                if (results.affectedRows !== 1){
                    return res.cc("注册用户失败，请稍后再试");
                }
                res.cc("注册成功", 200);
            }
        )
    })
};

exports.login = (req, res) => {
    res.send("登录成功");
};