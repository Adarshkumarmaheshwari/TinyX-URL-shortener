const express = require('express')
const shortId = require('shortid')
const createHttpError = require('http-errors')
const mongoose = require('mongoose')
const path = require('path')
const dotenv = require('dotenv')
const clipboardy = require('clipboardy')
const { log } = require('console')
const ShortUrl=require('./models/url.model')
const connectDB = require('./config/db.env')
const { render } = require('ejs')

const app = express()
app.use(express.static(path.join(__dirname, 'public')))

app.use(express.json())
app.use(express.urlencoded({extended:false}))

//Load config
dotenv.config({path: './config/config.env'})

connectDB()

app.set('view engine', 'ejs')

app.get('/', async(req, res, next) =>{
    res.render('index')
})

app.post('/', async(req,res, next)=>{
try{
    const{url}= req.body
    if(!url){
        throw createHttpError.BadRequest('Kindly provide a valid URL!')
    }
    const urlExists = await ShortUrl.findOne({url})
    if(urlExists){
        res.render('index', {short_url: `/${urlExists.shortId}`})
        return
    }
    const shortUrl = new ShortUrl({url: url, shortId: shortId.generate()})
    const result =await shortUrl.save()
    res.render('index', {short_url: `/${result.shortId}`})
}catch(error){
    next(error)
}
})



app.get('/:shortId', async (req, res, next) => {
  try {
    const { shortId } = req.params
    const result = await ShortUrl.findOne({ shortId })
    if (!result) {
      throw createHttpError.NotFound('Url does not exist!')
    }
    res.redirect(result.url)
  } catch (error) {
    next(error)
  }
})
//Error handling

app.use((res, req, next)=>{
    next(createHttpError.NotFound())
})


app.use((err, req, res, next)=>{
    res.status(err.status || 500)
    res.render('index', {error: err.message})
})

const PORT = process.env.PORT || 3000

app.listen(
    PORT,
    console.log(`Server running on port`)
    )
