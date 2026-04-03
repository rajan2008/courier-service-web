try {
    console.log('Requiring dotenv...');
    require('dotenv');
    console.log('Requiring express...');
    require('express');
    console.log('Requiring cors...');
    require('cors');
    console.log('Requiring pg...');
    require('pg');
    console.log('Requiring bcrypt...');
    require('bcrypt');
    console.log('Requiring jsonwebtoken...');
    require('jsonwebtoken');
    console.log('Requiring nodemailer...');
    require('nodemailer');
    console.log('All required successfully!');
} catch (e) {
    console.error(e);
}
