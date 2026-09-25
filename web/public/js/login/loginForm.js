"use strict"; 

const form = document.getElementById( "loginForm" ); 
const errorBox = document.getElementById( "error" ); 
const loginButton = document.getElementById( "loginButton" ); 

function showError(message) { 
    errorBox.textContent = message; 
    errorBox.style.display = "block"; 
} 

function hideError() { 
    errorBox.textContent = ""; 
    errorBox.style.display = "none"; 
    
} 

form.addEventListener( "submit", async event => { 
    event.preventDefault(); 
    hideError(); 
    loginButton.disabled = true; 
    loginButton.textContent = "Anmeldung läuft ..."; 
    
    const username = document .getElementById( "username" ) .value .trim(); 
    const password = document .getElementById( "password" ) .value; 
    
    try { 
        const response = await fetch( "/api/auth/login", { 
                method: "POST", credentials: "same-origin", 
                headers: { "Content-Type": "application/json" }, 
                body: JSON.stringify({ username, password }) 
            } 
        ); 
        
        const data = await response.json(); 
        
        if (!response.ok) { 
            showError( data.error || "Anmeldung fehlgeschlagen." ); 
            return; 
        } 
        
        window.location.href = "/"; 

    } catch (error) { 

        showError( "Der Druckserver ist momentan nicht erreichbar." ); 

    } finally { 
        loginButton.disabled = false; 
        loginButton.textContent = "Anmelden";
     } 
}); 