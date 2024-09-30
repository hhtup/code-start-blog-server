// exports === module.exports
// 导入数据库连接对象
const db = require("../../db/index");
// 导入密码加密工具
const bcrypt = require("bcryptjs");
// 导入生成 Token 字符串的包
const jwt = require("jsonwebtoken");
// 导入用户数据验证规则对象
const { register_schema, login_schema, userInfo_schema } = require("../../schema/user");
// 导入jwt配置文件
const jwtConfig = require("../../jwt/config")
// 用户注册处理函数
exports.register = (req, res) => {
    // 接收表单数据
    const registerInfo = req.body;
    // 判断数据是否合法
    register_schema.validate(registerInfo);
    // 查询用户名是否被占用
    const sqlStr = "select * from user where username=?";
    db.query(sqlStr, [registerInfo.username], (err, results) => {
        // 执行 SQL 语句失败
        if (err) return res.cc(err);
        // 判断用户名是否被占用
        if (results.length > 0){
            return res.cc("用户名被占用，请更换其他用户名");
        }
        // 对密码进行加密
        registerInfo.password = bcrypt.hashSync(registerInfo.password, 10);
        // 执行 SQL 语句，插入新用户
        const sql = "insert into user set ?";
        db.query(
            sql, 
            {username: registerInfo.username, password: registerInfo.password, email: registerInfo.email, role: "user"}, 
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

// 用户登录处理函数
exports.login = (req, res) => {
    const loginInfo = req.body;
    login_schema.validate(loginInfo);
    const sqlStr = "select * from user where email=?";
    db.query(
        sqlStr, 
        [loginInfo.email],
        (err, results) => {
            // 执行 SQL 语句失败
            if (err) return res.cc(err);
            // 判断查询结果
            if (results.length !== 1){
                return res.cc("登录失败，邮箱错误！");
            }
            // 判断密码是否正确
            const compareResult = bcrypt.compareSync(
                loginInfo.password, 
                results[0].password
            );
            if (!compareResult){
                return res.cc("登录失败，密码错误！");
            }
            const user = {...results[0], password: "", avatar: "", intro: "", motto: ""};
            const tokenStr = jwt.sign(user, jwtConfig.jwtSecretKey, { expiresIn: jwtConfig.expiresIn });
            res.send({
                status: 200,
                message: "登录成功",
                data: {
                    token: tokenStr
                }
            })
        }
    )
};

// 获取用户信息
exports.getUserInfo = (req, res) => {
    const sqlStr = "select * from user where id=?";
    db.query(sqlStr, [req.auth.id], (err, results) => {
        // 执行 SQL 语句失败
        if (err) return res.cc(err);
        // 判断查询结果
        if (results.length !== 1){
            return res.cc("获取用户信息失败");
        }
        return res.send({
            status: 200,
            message: "获取用户信息成功",
            data: results[0]
        })
    })
}

// 更新用户信息
exports.updateUserInfo = (req, res) => {
    const { id } = req.body;
    const userInfo = req.body;
    delete userInfo.id
    userInfo_schema.validate(userInfo);
    const sqlStr = "update user set ? where id=?";
    db.query(sqlStr, [userInfo, id], (err, results) => {
        // 执行 SQL 语句失败
        if (err) return res.cc(err);
        // 判断影响行数
        if (results.affectedRows !== 1){
            return res.cc("更新用户信息失败");
        }
        return res.cc("更新用户信息成功", 200);
    })
}