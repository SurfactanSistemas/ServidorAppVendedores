### SERVIDOR VENDEDORES

---

##### Instalación

```
git clone https://github.com/SurfactanSistemas/ServidorAppVendedores.git
cd ServidorAppVendedores
yarn
cp .env.example .env
vim .env # y colocamos los datos necesarios.
```

##### Producción

```
sudo /etc/init.d/apache2 stop # Volamos apache2 para evitar conflictos con el puerto ::80

tsc

node dist/index.js # Ejecuta con el puerto ::80. Tener en cuenta que Apache2 ejecuta en el mismo puerto.
```

##### Requisitos

-   NodeJs >= 12
-   npm >= 8
-   VS Builds >= 2015

##### Posibles problemas

El paquete serial-bus puede no compilarse al ejecutar _yarn_. Esto se corrige reinstalando VS Builds. -> [link](https://github.com/nodejs/node-gyp#installation)
