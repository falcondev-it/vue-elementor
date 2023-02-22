import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import type { VueElementorElement } from './schema'
import { toKebabCase } from './utils'
import { CONFIG } from './config'

export const templates = {
  ssrScript: (element: VueElementorElement) => {
    return `
    import { createSSRApp } from 'vue'
    import { renderToString } from 'vue/server-renderer'
    import Component from '@/../${element.component}'
    
    const params = JSON.parse(process.argv.slice(2).join('') || '{}')
    const app = createSSRApp(Component, params)

    renderToString(app).then((html) => {
      console.log(\`<${toKebabCase(
        element.name,
      )} widget-id="\${params.widgetId}">\${html}</${toKebabCase(
      element.name,
    )}>\`)
    })
  `
  },
  clientScript: (element: VueElementorElement) => {
    return `
  import { defineCustomElement } from 'vue'
  import Component from '@/../${element.component}'
  
  const Element = defineCustomElement({
    setup: () => {
      return (vue) => {
        return h(Component, {
          settings: window.__VUE_ELEMENTOR_DATA__[vue?.$attrs?.widgetId ?? ''],
          ...(vue?.$attrs ?? {}),
        })
      }
    },
    styles: Component.styles
  })
  
  customElements.define('${toKebabCase(element.name)}', Element)
`
  },
  wordpressWidget: (element: VueElementorElement) => {
    return `<?php

  if (!defined('ABSPATH')) {
      exit;
  }
  
  class Elementor_${element.name}_Widget extends \\Elementor\\Widget_Base
  {
      public function get_name()
      {
          return '${element.name}';
      }
  
      public function get_title()
      {
          return '${element.name}';
      }
  
      public function get_icon()
      {
          return 'eicon-code';
      }
  
      public function get_script_depends()
      {
          return ['elementor-${element.name}-widget'];
      }
  
      public function get_style_depends()
      {
          return ['elementor-${element.name}-widget'];
      }
  
      public function get_categories()
      {
          return ['general'];
      }
  
      public function get_keywords()
      {
          return [];
      }
  
      protected function register_controls()
      {
        ${!CONFIG.wordpressPluginSettings.widgetSettings ? '' : CONFIG.wordpressPluginSettings.widgetSettings.map((section) => {
          return `
          $this->start_controls_section(
            '${section.id}',
            [
              ${Object.entries(section.options ?? {}).map(([key, value]) => {
                return key === 'tab' || typeof value !== 'string' ? `'${key}' => ${value}` : `'${key}' => '${value}'`
              }).join(',\n')}
            ]
          );

          ${section.controls.map((control) => {
            return `
            $this->${control.responsive ? 'add_responsive_control' : 'add_control'}(
              '${control.name}',
              [
                ${Object.entries(control.options ?? {}).map(([key, value]) => {
                  return key === 'type' || typeof value !== 'string' ? `'${key}' => ${value}` : `'${key}' => '${value}'`
                }).join(',\n')}
              ]
            );
            `
          }).join('\n')}

          $this->end_controls_section();
          `
        }).join('\n')}
      }
  
      protected function render()
      {
          $html = [];
  
          $args = [
            "settings" => $this->get_settings_for_display(),
            "widgetId" => $this->get_id()
          ];

          $script = '<script> if(!window.__VUE_ELEMENTOR_DATA__) { window.__VUE_ELEMENTOR_DATA__ = {} } window.__VUE_ELEMENTOR_DATA__["' . $args['widgetId'] . '"] = ' . json_encode($args['settings']) . ' </script>';
          
          echo $script;
          exec(__DIR__ . '/assets/${element.name}.ssr ' . json_encode(json_encode($args)), $html);
          for ($i = 0; $i < count($html); $i++) {
              echo $html[$i];
          }
      }
  }
  
`
  },
  wordpressPlugin: async () => {
    const pluginOutletString = `
    function register_widgets($widgets_manager)
    {
        ${CONFIG.elements
          .map((element) => {
            return `require_once(__DIR__ . '/${element.name}.widget.php');
          $widgets_manager->register(new \\Elementor_${element.name}_Widget());`
          })
          .join('\n')}
    }
    add_action('elementor/widgets/register', 'register_widgets');
    
    function register_dependencies()
    {
        ${CONFIG.elements.map((element) => {
          return `
          wp_register_script('elementor-${element.name}-widget', plugin_dir_url(__FILE__) . 'assets/${element.name}.el.js', [], '${CONFIG.version}', false);
          //wp_register_style('elementor-${element.name}-widget', plugin_dir_url(__FILE__) . 'assets/${element.name}.el.css', [], '${CONFIG.version}', 'all');`
        })}
    }
    add_action('wp_enqueue_scripts', 'register_dependencies');
    
    function add_type_attribute($tag, $handle, $src)
    {
        $pattern = "/${CONFIG.elements.map(el => el.name).join('|')}/i";
        if (!preg_match($pattern, $handle)) {
            return $tag;
        }
        
        $tag = '<script type="module" src="' . esc_url($src) . '"></script>';
        return $tag;
    }
    add_filter('script_loader_tag', 'add_type_attribute', 10, 3);
    
    function make_script_executable()
    {
        ${CONFIG.elements
          .map((element) => {
            return `exec('chmod +x ' . __DIR__ . '/assets/${element.name}.ssr');`
          })
          .join('\n')}
    }
  
    register_activation_hook(
        __FILE__,
        'make_script_executable'
    );
    
    `
    if (CONFIG.wordpressPluginSettings.templateFile) {
      const templateFilePath = path.join(process.cwd(), CONFIG.wordpressPluginSettings.templateFile)
      const templateFileContents = await fs.readFile(templateFilePath, 'utf-8').then(data => data.toString())

      const placeholderRegex = /\/\/\s*VUE-ELEMENTOR-OUTLET/gi
      const hasPlaceholders = placeholderRegex.test(templateFileContents)

      if (!hasPlaceholders)
        throw new Error('The template file does not contain the required placeholder (// VUE-ELEMENTOR-OUTLET)')

      return templateFileContents.replace(placeholderRegex, pluginOutletString).trim()
    }

    return `<?php
  
    /**
     * Plugin Name: ${CONFIG.wordpressPluginSettings.name}
     * Description: ${CONFIG.wordpressPluginSettings.name}
     * Plugin URI:  https://elementor.com/
     * Version:     ${CONFIG.version}
     * Author:      Elementor Developer
     * Author URI:  https://developers.elementor.com/
     *
     * Elementor tested up to: 3.7.0
     * Elementor Pro tested up to: 3.7.0
     */
    
    if (!defined('ABSPATH')) {
        exit;
    }
    
    ${pluginOutletString}
    `.trim()
  },
}
