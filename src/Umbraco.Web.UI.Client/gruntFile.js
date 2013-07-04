module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-recess');

  grunt.loadNpmTasks('grunt-karma');
  
  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-markdown');
  grunt.loadNpmTasks('grunt-contrib-connect');

  // Default task.
  grunt.registerTask('default', ['jshint:dev','build','karma:unit']);
  grunt.registerTask('dev', ['jshint:dev', 'build', 'webserver', 'open:dev', 'watch']);
  
  //run by the watch task
  grunt.registerTask('watch-build', ['jshint:dev','recess:build','concat','copy','karma:unit']);
  
  //triggered from grunt dev or grunt
  grunt.registerTask('build', ['clean','concat','recess:build','copy']);

  //utillity tasks
  grunt.registerTask('docs', ['markdown']);
  grunt.registerTask('webserver', ['connect:devserver']);

  // Print a timestamp (useful for when watching)
  grunt.registerTask('timestamp', function() {
    grunt.log.subhead(Date());
  });

  // Project configuration.
  grunt.initConfig({
    connect: {
             devserver: {
               options: {
                 port: 9999,
                 hostname: '0.0.0.0',
                 base: './build',
                 middleware: function(connect, options){
                   return [
                     //uncomment to enable CSP
                     // util.csp(),
                     //util.rewrite(),
                     connect.favicon('images/favicon.ico'),
                     connect.static(options.base),
                     connect.directory(options.base)
                   ];
                 }
               }
             },
             testserver: {}
           },

    open : {
      dev : {
        path: 'http://localhost:9999/belle/'
      }
    },

    distdir: 'build/belle',
    vsdir: '../Umbraco.Web.Ui/umbraco',
    pkg: grunt.file.readJSON('package.json'),
    banner:
    '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
    '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
    ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>;\n' +
    ' * Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>\n */\n',
    src: {
      js: ['src/**/*.js', '<%= distdir %>/templates/**/*.js'],
      common: ['src/common/**/*.js'],
      specs: ['test/**/*.spec.js'],
      scenarios: ['test/**/*.scenario.js'],
      samples: ['sample files/*.js'],
      html: ['src/index.html'],

      everything:['src/**/*.*', 'test/**/*.*', 'docs/**/*.*'],

      tpl: {
        app: ['src/views/**/*.html'],
        common: ['src/common/**/*.tpl.html']
      },
      less: ['src/less/belle.less'], // recess:build doesn't accept ** in its file patterns
      prod: ['<%= distdir %>/js/*.js']
    },

    clean: ['<%= distdir %>/*'],

    copy: {
      assets: {
        files: [{ dest: '<%= distdir %>/assets', src : '**', expand: true, cwd: 'src/assets/' }]
      },
      vendor: {
        files: [{ dest: '<%= distdir %>/lib', src : '**', expand: true, cwd: 'lib/' }]
      },
      views: {
        files: [{ dest: '<%= distdir %>/views', src : '**/*.*', expand: true, cwd: 'src/views/' }]
      },
      app: {
        files: [
            { dest: '<%= distdir %>/js', src : '*.js', expand: true, cwd: 'src/' }
            ]
      },
      media: {
        files: [{ dest: 'build/media', src : '*.*', expand: true, cwd: 'media/' }]
      },
      
      mocks: {
        files: [{ dest: '<%= distdir %>/js', src : '*.js', expand: true, cwd: 'src/common/mocks/' }]
      },

      vs: {
        files: [{ dest: '<%= vsdir %>', src : '**', expand: true, cwd: '<%= distdir %>' }]
      }
    },

    karma: {
      unit: { configFile: 'test/config/karma.conf.js', keepalive: true },
      e2e: { configFile: 'test/config/e2e.js', keepalive: true },
      watch: { configFile: 'test/config/unit.js', singleRun:false, autoWatch: true, keepalive: true }
    },

    concat:{
      index: {
        src: ['src/index.html'],
        dest: '<%= distdir %>/index.html',
        options: {
          process: true
        }
      },
      angular: {
        src:['vendor/angular/angular.min.js'],
        dest: '<%= distdir %>/lib/angular/angular.min.js'
      },
      controllers: {
        src:['src/views/**/*.controller.js'],
        dest: '<%= distdir %>/js/umbraco.controllers.js'
      },
      services: {
        src:['src/common/services/*.js'],
        dest: '<%= distdir %>/js/umbraco.services.js'
      },
      security: {
        src:['src/common/security/*.js'],
        dest: '<%= distdir %>/js/umbraco.security.js'
      },
      resources: {
        src:['src/common/resources/*.js'],
        dest: '<%= distdir %>/js/umbraco.resources.js'
      },
      testing: {
        src:['src/common/mocks/resources/*.js'],
        dest: '<%= distdir %>/js/umbraco.testing.js'
      },
      directives: {
        src:['src/common/directives/*.js'],
        dest: '<%= distdir %>/js/umbraco.directives.js'
      },
      filters: {
        src:['src/common/filters/*.js'],
        dest: '<%= distdir %>/js/umbraco.filters.js'
      }
    },

    uglify: {
      dist:{
        options: {
          banner: "<%= banner %>"
        },
        src:['<%= src.js %>'],
        dest:'<%= distdir %>/<%= pkg.name %>.js'
      },
      angular: {
        src:['<%= concat.angular.src %>'],
        dest: '<%= distdir %>/angular.js'
      },
      jquery: {
        src:['vendor/jquery/*.js'],
        dest: '<%= distdir %>/jquery.js'
      }
    },

    recess: {
      build: {
        files: {
          '<%= distdir %>/assets/css/<%= pkg.name %>.css':
          ['<%= src.less %>'] },
        options: {
          compile: true
        }
      },
      min: {
        files: {
          '<%= distdir %>/assets/css/<%= pkg.name %>.css': ['<%= src.less %>']
        },
        options: {
          compress: true
        }
      }
    },

    watch:{
      dev: {
        files:['<%= src.everything %>'],
        tasks:['watch-build','timestamp']
      }
    },

    markdown: {
        all: {
          files: ['docs/src/*.md'],
          dest: 'docs/html/'
        }
    },


    jshint:{
      dev:{
         files:['<%= src.common %>', '<%= src.specs %>', '<%= src.scenarios %>', '<%= src.samples %>'],
         options:{
           curly:true,
           eqeqeq:true,
           immed:true,
           latedef:true,
           newcap:true,
           noarg:true,
           sub:true,
           boss:true,
           eqnull: true,
             //NOTE: we need to use eval sometimes so ignore it
           evil: true,
             //NOTE: we need to check for strings such as "javascript:" so don't throw errors regarding those
           scripturl: true,
             //NOTE: we ignore tabs vs spaces because enforcing that causes lots of errors depending on the text editor being used
           smarttabs: true,
           globals:{}
         } 
      },
      build:{
         files:['<%= src.prod %>'],
         options:{
           curly:true,
           eqeqeq:true,
           immed:true,
           latedef:true,
           newcap:true,
           noarg:true,
           sub:true,
           boss:true,
           eqnull: true,
             //NOTE: we need to use eval sometimes so ignore it
           evil: true,
            //NOTE: we need to check for strings such as "javascript:" so don't throw errors regarding those
           scripturl: true,
            //NOTE: we ignore tabs vs spaces because enforcing that causes lots of errors depending on the text editor being used
           smarttabs: true,
           globalstrict:true,
           globals:{$:false, jQuery:false,define:false,require:false,window:false}
         } 
      }
    }
  });

};