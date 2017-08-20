module.exports = function(req, res, next) {
    res.status(400);
    res.render('404');
}