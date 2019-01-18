// vue-loader at least v13.0.0+

// module.exports = file => require('@/views/' + file + '.vue').default

// function view(name) {
//   return function(resolve) {
//     System.import(`@/views/${name}.vue`).then(mod => {
//       resolve(mod)
//     })
//   }
// }

export default file => resolve => {
    import(/*   webpackMode:      "lazy",
                webpackChunkName: "sidebar-view-`${file}`" */
    `@/views/${file}.vue`).then(module => {
        resolve(module.default);
    });
};
