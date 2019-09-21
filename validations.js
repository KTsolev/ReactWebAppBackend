
const onlyLetters = /^[a-zA-Z\s]|[а-яА-Я\s]+$/;
const validEmail = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;


module.exports = {
    onlyLetters,
    validEmail
};