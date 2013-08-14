/*global module:true */

/**
 * @param {function} grunt .
 */
module.exports = function(grunt) {
  var srcFiles = [
    'src/header.js',
    'src/variable.js',
    'src/util.js',
    'src/markInfo.js',
    'src/emphasis.js',
    'src/footer.js'
  ];
  var hintFiles = [
    'gruntfile.js',
    'src/variable.js',
    'src/util.js',
    'src/markInfo.js',
    'src/emphasis.js'
  ];

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: '\n'
      },
      dist: {
        src: srcFiles,
        dest: 'src/jquery.emphasis.js'
      }
    },
    uglify: {
      options: {
        banner: '/*!\n jquery.emphasis.js\n' +
            ' <%= pkg.version %>\n' +
            ' <%= grunt.template.today("dd-mm-yyyy") %>\n*/\n'
      },
      dist: {
        files: {
          'bin/jquery.emphasis.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },
    jshint: {
      files: hintFiles,
      options: {
        // options here to override JSHint defaults
        globals: {
          jQuery: true,
          module: true,
          document: true,
          $: true
        },
        undef: true,
        browser: true,
        noarg: true,
        curly: true,
        newcap: true,
        trailing: true,
        noempty: true,
        regexp: false,
        evil: true,
        funcscope: true,
        iterator: true,
        loopfunc: true,
        multistr: true,
        boss: true,
        eqnull: true,
        eqeqeq: true,
        laxbreak: true
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('test', ['jshint']);

  grunt.registerTask('default', ['jshint', 'concat', 'uglify']);

};
