module.exports = function (url) {
    return (
        `
        <html lang="en">
        <head>
            <style>
                body {
                    background-color: #f8f9fa;
                    font-family: 'Nunito', sans-serif;
                }
    
                section {
                    background-color: #F5F6F7;
                    border: 1px solid #DFE1E6;
                    max-width: 35rem;
                    margin: 1rem auto;
                    border-radius: 5px;
                    padding: 1rem;
                    text-align: center;
                    box-shadow: 0 5px 10px 5px rgba(0, 0, 0, .1);
                    padding: 15px;  
                }
    
                section > * {margin: 15px;}
    
                a {display: block;}

                a:hover {cursor: pointer;}
    
                h1 {font-size: 1.5rem;}
    
                p {
                    text-align: center;
                    font-weight: bold;
                    color: #495057;
                }
    
                img {max-width: 6rem;}
    
                button {
                    text-align: center; 
                    background-color: #147df5; 
                    color: white; 
                    padding: 1.25rem 2.5rem; 
                    border-radius: 6px; 
                    border: solid; cursor: pointer; 
                    border-color: #d7d7db; 
                    font-family: inherit; 
                    font-size: 20px; 
                    opacity: .85;
                }
    
            </style>
        </head>
        <body>
            <main>
                <section>
                    <a id="giftee-link" href="https://gift-ee.herokuapp.com/"><img src="https://raw.githubusercontent.com/AGuyNamedC-Los/gift-ee/master/public/website_images/giftee-logo.png" alt="giftee-logo"></a>
                    <h1>Account Verification</h1>
                    <p>Hello, <br> <br> Thank you for making an account for Giftee. Please confirm your email address by clicking the link below</p>
                    <a href="${url}" style="display: inline-block;"><button>Verify your email address</button></a>
                </section>
            </main>
        </body>
    </html>
        `
    )
};