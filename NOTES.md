# Notes

## Learning References

- [Three.js](https://threejs.org/) ~ Three.js is a JavaScript library that allows users to create 3D graphics and animations in a web browser. It uses WebGL, a graphics API that allows users to render 2D and 3D graphics in an HTML5 canvas.
- [Discover Three.js](https://discoverthreejs.com/) ~ Discover three.js is a complete introduction to the web as a platform for 3D graphics using the three.js WebGL library, from one of the core three.js developers.
- [Three.js Journey](https://threejs-journey.com/) 💰 ~ Become a Three.js developer. Everything you need in one place. Three.js Journey is the most complete, yet accessible course you can find.

## JSDoc

JavaScript documentation is available in the [docs](./docs/index.html) directory.

### Regenerate Documentation

Ensure the [JSDoc](https://jsdoc.app/) package and the [Clean JSDoc Theme](https://github.com/ankitskvmdam/clean-jsdoc-theme) template are installed globally.

```
npm install -g jsdoc
npm install -g clean-jsdoc-theme
```

To regenerate documentation, run the following command.

```
rm -rf docs && jsdoc -t `npm root -g`/clean-jsdoc-theme -d docs -r src/*
```
