const crypto = require('crypto');
const util = require('../modules/util');
const responseMessage = require('../modules/responseMessage');
const statusCode = require('../modules/statusCode');
let usersDB = require('../modules/users');

const postSignup = (req, res) => {
    // 1. req.body에서 데이터 가져오기
    const {
        body : {id, password}
    } = req;  

    //2. request data 확인하기, id 또는 password data가 없다면 NullValue 반환
    if(!id || !password){
        console.log('필요한 값이 없습니다.')
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE))
    }

    //3. 존재하는 아이디인지 확인하기. 이미 존재하는 아이디면 ALREADY ID 반환
    const idx = usersDB.find(user => user.id == id);
    if(idx === id){
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.ALREADY_ID)) 
    }

    //4. salt 생성
    const salt = crypto.randomBytes(64).toString('base64');    

    //5. 2차 세미나때 배웠던 pbkdf2 방식으로 (비밀번호 + salt) 해싱하여 => 암호화된 password 를 만들기!
    const cryptedPassword = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('base64');        
            
    //6. usersDB에 id, 암호화된 password, salt 저장!
    const user = {
    id,
    password: cryptedPassword,
    salt
    }          

    usersDB.push(user)

    //7. status: 200 message: SING_UP_SUCCESS, data: id만 반환! (비밀번호, salt 반환 금지!!)
    return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SIGN_UP_SUCCESS, id))
}


const postSignin = (req, res) => {
    // 1. req.body에서 데이터 가져오기
    const {
        body : {id, password} 
    } = req;
    
    //2. request data 확인하기, id 또는 password data가 없다면 NullValue 반환
    if(!id || !password){
        console.log('필요한 값이 없습니다.')
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE))
    }

    //3. 존재하는 아이디인지 확인하기. 존재하지 않는 아이디면 NO USER 반환'
    const idx = usersDB.find(user => user.id == id);
        if(idx === undefined){
            return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_USER)) 
        }


    //4. 비밀번호 확인하기 - 로그인할 id의 salt를 DB에서 가져와서  사용자가 request로 보낸 password와
    //   암호화를 한후 디비에 저장되어있는 password와 일치하면 true일치하지 않으면 Miss Match password 반환
    const { salt, password: cryptedPassword } = idx
        const newCryptedPassword = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('base64')
        if (newCryptedPassword !== cryptedPassword) {
            return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.MISS_MATCH_PW))
        }        
    
    //5. status: 200 ,message: SIGNIN SUCCESS, data: id 반환 (비밀번호, salt 반환 금지!!)
    return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SIGN_IN_SUCCESS, id))
}


const getUsersInfo = (req, res) => {
    // 1.모든 유저정보 조회 (id, password, salt)!
    return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.MEMBER_READ_ALL_SUCCESS, usersDB))
}

const userController = {
    postSignup,
    postSignin,
    getUsersInfo
}

module.exports = userController;