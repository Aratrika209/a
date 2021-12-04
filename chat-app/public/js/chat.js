const socket = io()
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $message = document.querySelector('#message')
const messageTemplate = document.querySelector('#message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
const {username, room}= Qs.parse(location.search,{ignoreQueryPrefix:true})
const autoscroll = ()=>{
    const $newMessage = $message.lastElementChild
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight= $newMessage.offsetHeight+newMessageMargin
    const visibleHeight = $message.offsetHeight
    const containerHeight = $message.scrollHeight
    const scrollOffset = $message.scrollTop+visibleHeight
    if(containerHeight-newMessageHeight<=scrollOffset){
        $message.scrollTop = $message.scrollHeight
    }

}
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
socket.on('message', (message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message : message.text,
        createdAt : moment(message.createdAt).format('h:mm a')
    })
    $message.insertAdjacentHTML('beforeend',html)
    autoscroll()
})
socket.on('locationMessage',(message)=>{
    console.log(message)
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt : moment(message.createdAt).format('h:mm a')
    })
    $message.insertAdjacentHTML('beforeend', html)
    autoscroll()
})
socket.on('roomData', ({room,users})=>{
    console.log(users)
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
})
document.querySelector('#message-form').addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled')
    const message = document.querySelector('input').value
    socket.emit('sendMessage',message,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
        if(error){
            return console.log(error)
        }
        console.log('Message delivered!')
    })
})
document.querySelector('#send-location').addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supporteed by your browser!')
    }
    $sendLocationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation',{
            lalitude:position.coords.latitude,
            longitude: position.coords.longitude
        },()=>{
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared!')
        })
    })
})
socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})