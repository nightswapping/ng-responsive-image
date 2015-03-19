module.exports = function (grunt) {
  'use strict';


  /**
   * FILES CONFIGURATION
   */
  grunt.initConfig({

    src_dir: 'src',
    dist_dir: 'dist',

    files: {
      js: [ '<%= src_dir %>/**/*.js', '!<%= src_dir %>/**/*.spec.js' ],
      jsunit: [ '<%= src_dir %>/**/*.unit.spec.js' ],
      config: [ 'Gruntfile.js', 'karma-conf.js' ]
    }
  });


  /**
   * LINTERS CONFIGURATION
   */
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jscs');

  grunt.config.merge({

    /**
     * 'jshint' defines the rules of our linter as well as which files we should check. All our JS files including
     * sources, tests and configs are linted based on the policies listed in 'options'.
     */
    jshint: {
      src: [ '<%= files.js %>' ],
      test_unit: [ '<%= files.jsunit %>' ],
      gruntfile: [ '<%= files.config %>' ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    /**
     * JSCS is a stricter and more granular linter, that allows us to maintain consistent coding style.
     * Look here for all the possible rules and their values:  https://github.com/jscs-dev/node-jscs#rules
     */
    jscs: {
      src: [ '<%= files.js %>' ],
      test_unit: [ '<%= files.jsunit %>' ],
      gruntfile: [ '<%= files.config %>' ]
    }
  });

  grunt.registerTask('linters', [ 'jshint', 'jscs' ]);


  /**
   * TESTS CONFIGURATION
   */
  grunt.loadNpmTasks('grunt-karma');

  grunt.config.merge({

    // Karma is our test runner. It will start a browser and run our unit tests automatically.
    karma: {
      options: {
        configFile: 'karma-conf.js'
      },
      // Test with watch during development
      unit: {
        options: {
          singleRun: false,
          autoWatch: true
        }
      },
      // Test the concatenated distribution
      unit_dist: {
        files: {
          src: [
            'bower_components/angular/angular.js',
            'bower_components/angular-mocks/angular-mocks.js',
            '<%= files.jsunit %>',
            '<%= dist_dir %>/<%= pkg.name %>.js'
          ]
        }
      },
      // Test the minified distribution
      unit_dist_min: {
        files: {
          src: [
            'bower_components/angular/angular.js',
            'bower_components/angular-mocks/angular-mocks.js',
            '<%= files.jsunit %>',
            '<%= dist_dir %>/<%= pkg.name %>.min.js'
          ]
        }
      }
    }
  });

  /**
   * DIST CONFIGURATION
   */
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.config.merge({
    // Meta info to be used by the build tasks
    pkg: grunt.file.readJSON("package.json"),

    // Add information on the module at the top of the dist files
    banner:
      '/**!\n' +
      ' * <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
      ' *\n' +
      ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
      ' * Distributed under the MIT licence\n' +
      ' */\n',

    // Clean the dist dir before we restart the build
    clean: {
      dist: [ '<%= dist_dir %>' ]
    },

    // Concat allows us to build a non-minified version of the lib
    concat: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: [ '<%= files.js %>' ],
        dest: '<%= dist_dir %>/<%= pkg.name %>.js'
      }
    },

    // Uglify builds the minified version of the lib
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: [ '<%= files.js %>' ],
        dest: '<%= dist_dir %>/<%= pkg.name %>.min.js'
      }
    }
  });


  /**
   * Main tasks configuration
   */
  grunt.registerTask('default', [ 'linters', 'karma:unit' ]);

  grunt.registerTask('build', [ 'linters', 'clean', 'concat', 'karma:unit_dist', 'uglify', 'karma:unit_dist_min' ]);

};