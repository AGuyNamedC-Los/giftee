module.exports = function (emailCode) {
    return (
        `
        <html lang="en">
            <head>
                <style>
                    #email-content {
                        background-color: #F5F6F7;
                        border: 1px solid #DFE1E6;
                        max-width: 35rem;
                        margin: 1rem auto;
                        border-radius: 5px;
                        padding: 1rem;
                        text-align: center;
                    }
                
                    a, img{
                        display: flex;
                        width: 100%;
                        max-width: 7rem;
                        margin: 1rem auto;
                    }
        
                    img {
                        background-color: white;
                    }
                
                    #top, #bottom {
                        border: 5px solid;
                        width: 100%;
                        max-width: 20rem;
                        margin: 0 auto;
                        background-color: white;
                    }
                
                    #top {
                        padding: 1rem 0;
                        max-width: 21rem;
                        border-radius: 5px;
                        margin-bottom: 1rem;
                    }
                
                    #bottom {
                        padding: 5rem 0;
                        margin-top: 1rem;
                    }
                
                    #content {
                        display: flex;
                        flex-direction: column;
                    }
                
                    p {
                        text-align: center;
                        padding: 0; margin:0;
                        font-family: "GTWalsheim", system-ui, sans-serif;
                        text-rendering: optimizelegibility;
                    }
                
                    #content p {
                        font-size: 1.5rem;
                        display: block;
                        width: 50%;
                        margin: 0 auto;
                        min-width: 5rem;
                        padding: .5rem 0;
                        border: solid;
                        border-radius: 5px;
                        color: white;
                        background-color: #0060E0;
                        border: solid;
                        border-radius: 5px;
                        border-color: black;
                    }
                </style>
            </head>
            <body>
                <main>
                    <div id="email-content">
                        <a href="https://gift-ee.herokuapp.com/"><img src="https://raw.githubusercontent.com/AGuyNamedC-Los/gift-ee/master/public/website_images/giftee-logo.png" alt="giftee-logo"></a>
                        <div id="gift">
                            <div id="top"></div>
                            <div id="content">
                                <p>${emailCode}</p>
                            </div>
                            <div id="bottom">
                                <p>Above is your confirmation code!</p>
                            </div>
                        </div>
                    </div>
                </main>
            </body>
        </html>
        `
    )
};