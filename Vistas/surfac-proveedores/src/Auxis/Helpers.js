// const BASE_URL = "http://bb8a5feb.ngrok.io"; // Desarrollo
const BASE_URL = "http://201.231.98.97"; // Produccion

export function getUrlConsulta(){
    return `${BASE_URL}/Api/Proveedores`;
}

export function fetchPost(url, parameters){
    return fetch(getUrlConsulta() + url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(parameters)
    });
}