module.exports = function(req, res, next) {
    if(req.signedCookies.userID2 != undefined){
        req.authorized = true;
    }
    next()
}