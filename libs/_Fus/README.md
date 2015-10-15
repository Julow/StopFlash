# Fus

_v1.0.0_

POO pour Nodejs & navigateur.

_`extend`, `equal` et `clone`._

### Get it! _(Nodejs)_

Fus est dans [npm](https://npmjs.org/package/fus).

```
$ npm install fus
```

```js
var fus = require('fus');
```

### Exemple

```js
function Klass1(a)
{
    this.a = a;
}

function Klass2(a, b)
{
    // Appeller super
    this.super(a); // Methode 1: TOUJOURS: Ne pas oublier
    Klass2.super(this, a); // Methode 2 (Conseillé): Peut être oublié

    this.b = b;
}
fus.extend(Klass2, Klass1); // Etend Klass2 avec Klass1

var exemple = new Klass2('a', 'b');

console.inspect(exemple);
```

Affiche:
```js
{
    a: 'a',
    b: 'b'
}
```

_Plus d'exemple sur `extend` dans [exemple.js](exemple.js)._

### Références

_Ce sont les mêmes fonctions pour Nodejs et pour navigateur._

##### Fonction `fus.extend(klass, parent)`

_void_ Extend la `klass` avec la classe `parent`.

* `klass` _class_ Classe à étendre.
* `parent` _class_ Classe parente.

Le `prototype` de `parent` est copiée et la méthode et la fonction `super()` sont ajoutées à `klass` _qui prend comme argument les mêmes arguments de `parent`_.

__Une classe étendue doit toujours exécuter la méthode `this.super(arg, arg2)` sauf si vous utilisez la fonction `klass.super(this, arg, arg2)` !__

##### Fonction `fus.clone(obj, recursif)`

_Object_ Retourne la copie de `obj`. Si `recursif` est `true`, les propriétés seront clonnées aussi.

* `obj` _Object_ Objet à cloner.
* `recursive` _boolean_ Copie récursive. _(Optionnel, par défaut `false`)_

_Si `obj` n'est pas un objet, clone retourne `null`._

##### Fonction `fus.equal(obj1, obj2)`

_boolean_ Retourne `true` si `obj1` et `obj2` sont identiques.

* `obj1` _Object_ Objet 1.
* `obj2` _Object_ Objet 2.

`obj1` et `obj2` peuvent être d'une instance ou d'une classe différente, seul les valeurs sont testées.
_Si `obj1` ou `obj2` n'est pas un objet, une comparaison stricte `===` sera retournée._

### + d'Exemple

```js
var fus = require('fus');

function Vehicule(type, roues)
{
    this.type = type;
    this.roues = roues;
}

function Voiture(modele)
{
    this.super('voiture', 4);

    this.modele = modele;
}
fus.extend(Voiture, Vehicule);

function Camion(type, poid, roues)
{
    this.super(type, roues);

    this.poid = poid;
}
fus.extend(Camion, Vehicule);

function PoidLourd(poid, remorque)
{
    this.super('poid lourd', poid, remorque? 10 : 4);

    this.remorque = remorque;
}
fus.extend(PoidLourd, Camion);


var voiture = new Voiture('golf');
/**
 * type: 'voiture'
 * roues: 4
 * modele: 'gold'
 */

var camion = new Camion('benne', 3.5, 4);
/**
 * type: 'benne'
 * roues: 4
 * poid: 3.5
 */

var camion2 = new PoidLourd(38, true);
/**
 * type: 'poid lourd'
 * roues: 10
 * poid: 38
 * remorque: true
 */
```

### License

> The MIT License (MIT)
> 
> Copyright (c) 2013 juloo
> 
> Permission is hereby granted, free of charge, to any person obtaining a copy of
> this software and associated documentation files (the "Software"), to deal in
> the Software without restriction, including without limitation the rights to
> use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
> the Software, and to permit persons to whom the Software is furnished to do so,
> subject to the following conditions:
> 
> The above copyright notice and this permission notice shall be included in all
> copies or substantial portions of the Software.
> 
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
> FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
> COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
> IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
> CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
