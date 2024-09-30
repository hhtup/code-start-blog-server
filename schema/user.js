const Joi = require("joi");

exports.register_schema = Joi.object({
    // 验证用户名的规则：字符串类型，长度在3到20个字符之间，为必填项
    username: Joi.string().min(3).max(20).required(),
    // 密码需符合正则表达式：6-15位，包含字母、数字、特殊字符
    password: Joi.string().pattern(/^[A-Za-z0-9@!#$%^&*()_+={}\[\]:;.,?~`-]{6,15}$/).required(),
    email: Joi.string().email().required(),
}).unknown(true);   // 设置 unknown 为 true 来忽略额外的字段

exports.login_schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().pattern(/^[A-Za-z0-9@!#$%^&*()_+={}\[\]:;.,?~`-]{6,15}$/).required()
}).unknown(true);

exports.userInfo_schema = Joi.object({
    username: Joi.string().min(3).max(20).required(),
    password: Joi.string().pattern(/^[A-Za-z0-9@!#$%^&*()_+={}\[\]:;.,?~`-]{6,15}$/),
    email: Joi.string().email(),
    avatar: Joi.string().uri(),
}).unknown(true);