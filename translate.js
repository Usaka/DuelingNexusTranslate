// ==UserScript==
// @name         Translate (EN,ES,FR,DE,IT,PT)
// @namespace    https://raw.githubusercontent.com/Usaka/
// @version      0.0.1
// @description  Script para traducir la descripción de las cartas a los idiomas soportados en yugioh.fandom.com
// @author       Usaka_Rokujou
// @match        https://duelingnexus.com/*
// @grant        none
// @homepage     https://github.com/Usaka/dn-translate/edit/master/translate.js
// @homepageURL  https://github.com/Usaka/dn-translate/edit/master/translate.js
// @downloadURL  https://raw.githubusercontent.com/Usaka/dn-translate/master/translate.js
// @supportURL   https://github.com/Usaka/dn-translate/issues
// ==/UserScript==

function changeLanguage(){
    localStorage.setItem('language', select.value)
    language = select.value
    let temp = lastCurrentCardId
    lastCurrentCardId = 0
    Engine.ui.setCardInfo(temp)
}

function loadLanguage(a){
    if (!(0 >= a) && lastCurrentCardId !== a) {
        lastCurrentCardId = a
        document.getElementById("card-name").innerHTML = 'Wait...'
        document.getElementById("card-description").innerHTML = 'Wait...'

        if(cardsTemp[a]){
            document.getElementById("card-name").innerHTML = cardsTemp[a][language].name
            document.getElementById("card-description").innerHTML = cardsTemp[a][language].lore
        }else{
            a = Engine.getCardData(a)
            const name = a.name
            // achichi%20@Ignister
            fetch(`https://yugioh.fandom.com/api.php?action=query&titles=${name}&prop=revisions&rvslots=*&rvprop=content&formatversion=2&format=json&origin=*`)
                .then(res => res.json())
                .then(result => {
                var content = result.query?.pages[0]?.revisions[0]?.slots?.main?.content

                content = content.split('|')
                console.log(content)
                languageList.forEach(l => {
                    if(l !== 'en'){
                        let translate = {
                            name : content.find(f => f.includes(`${l}_name`))?.split('=')[1]?.trim(),
                            lore : content.find(f => f.includes(`${l}_lore`))?.split('=')[1]?.trim().replace('\'',''),
                        }

                        if(cardsTemp[a.id]){
                            cardsTemp[a.id][l] = translate
                        }else{
                            cardsTemp[a.id] = {}
                            cardsTemp[a.id][l] = translate
                        }
                    }
                })

                localStorage.setItem('cardsTemp', JSON.stringify(cardsTemp));
                lastCurrentCardId = 0
                loadLanguage(this.currentCardId)
            })
        }
    }
}

var cardsTemp = JSON.parse(localStorage.getItem('cardsTemp'));

if(!cardsTemp){
    cardsTemp = {}
}

var language = localStorage.getItem('language')

if(!language){
    language = 'en'
}

var languageList = ['en','es','fr','de','it','pt'];

var select = document.createElement("select")
select.id = 'language'
select.addEventListener('change', changeLanguage)

languageList.forEach(l => {
    var option = document.createElement("option")
    option.value = l
    option.text = l.toUpperCase()

    select.appendChild(option)
})

select.value = language

document.getElementById('editor-menu-content')?.appendChild(select)

var oldSetCardInfo = Engine.UI.prototype.setCardInfo

var lastCurrentCardId = 0

Engine.ui.setCardInfo = function(a){
    oldSetCardInfo.call(this, a);
    if(language !== 'en') loadLanguage.call(this, a);
};
