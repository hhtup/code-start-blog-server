// 导入 express
const express = require("express");
// 导入 cors 中间件
const cors = require("cors");
// 导入 body-parser 中间件，用于处理 JSON, Raw, Text 和 URL 编码的数据
const bodyParser = require("body-parser");
// 导入路由模块
const userRouter = require("./routes/api/user");
// 导入 Joi 来定义验证规则
const Joi = require("joi");

// 创建express服务器实例
const app = express();
// 将 cors 注册为全局中间件
app.use(cors());    // 不传参默认允许简单跨域和预检跨域
// 配置解析 application/json 格式数据的中间件
app.use(bodyParser.json());
// 配置解析 application/x-www-form-urlencoded 格式数据的中间件
app.use(bodyParser.urlencoded({extended: false}));
// 配置解析 application/x-www-form-urlencoded 格式的表单数据的中间件
// app.use(express.urlencoded({ extended: false }));

// 引入 jwt 配置文件
const jwtConfig = require("./jwt/config");
// 引入 express-jwt，解析 Token 的中间件
const expressJWT = require("express-jwt");

// 响应数据中间件
app.use((req, res, next) => {
  res.cc = (err, status = 400) => {
    res.send({
      status,
      // 状态信息: 判断 err 是 错误对象 还是 字符串
      message: err instanceof Error ? err.message : err
    })
  }
  next();
})

// 配置解析 Token 的中间件
// 使用.unless() 方法，指定哪些接口不需要进行 Token 的身份认证
app.use(
  expressJWT.expressjwt({ secret: jwtConfig.jwtSecretKey, algorithms: ["HS256"] }).unless({
    path: ["/api/login"]
  })
)

app.use(function(err, req, res, next) {
  // 表单验证错误
  if (err instanceof Joi.ValidationError) {
    return res.cc(err);
  }
  // 捕获身份认证失败的错误，token 问题
  if (err.name === "UnauthorizedError") {
    return res.cc("身份认证失败！", err.status)
  }
  // 未知错误
  res.cc(err);
})

// 注册路由模块
app.use("/api", userRouter);

const port = 3000;
// 启动服务器
app.listen(port, () => {
  console.log("server is running at port", port);
});
