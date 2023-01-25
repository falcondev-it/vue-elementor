import type { PluginMainTemplateOptions, WidgetControl, WidgetTemplateOptions } from '../types.js'

export const pluginMainTemplate = (opts: PluginMainTemplateOptions) => `
<?php
/**
 * Plugin Name: ${opts.pluginName}
 * Description: Auto embed any embbedable content from external URLs into Elementor.
 * Plugin URI:  https://elementor.com/
 * Version:     1.0.0
 * Author:      Elementor Developer
 * Author URI:  https://developers.elementor.com/
 * Text Domain: elementor-oembed-widget
 *
 * Elementor tested up to: 3.7.0
 * Elementor Pro tested up to: 3.7.0
 */

if ( ! defined( 'ABSPATH' ) ) {
  exit; // Exit if accessed directly.
}

function registerWidgets( $widgets_manager ) {
  ${opts.widgets.map(({ name }) => `require_once( __DIR__ . '/widgets/${name}/${name}.php' );\n$widgets_manager->register( new \\${opts.pluginName}${name}() );`).join('\n')}
}
add_action( 'elementor/widgets/register', 'registerWidgets' );

function registerScripts(){
  ${opts.widgets.map(({ name }) => `wp_register_script( '${opts.pluginName}_${name}', plugin_dir_url( __FILE__ ) . 'widgets/${name}/client.js', [], '1.0.0', true );`)}
  
}
add_action( 'wp_enqueue_scripts', 'registerScripts' );
`

export const widgetControlTemplate = (opts: WidgetControl) => `
$this->add${opts.responsive ? '_responsive' : ''}_control(
  '${opts.name}',
  [
    'label' => '${opts.label}',
    'type' => \Elementor\Controls_Manager::${opts.type},
  ]
);
`

export const widgetTemplate = (opts: WidgetTemplateOptions) => `
<?php
if ( ! defined( 'ABSPATH' ) ) {
  exit; // Exit if accessed directly.
}

class ${opts.pluginName}${opts.name} extends \\Elementor\\Widget_Base {

  public function get_name() {
    return '${opts.name}';
  }

  public function get_title() {
    return esc_html__( '${opts.name}', '${opts.pluginName}${opts.name}' );
  }

  public function get_icon() {
    return 'eicon-code';
  }

  public function get_script_depends() {
    return [ '${opts.pluginName}_${opts.name}' ];
  }

  public function get_categories() {
    return [ 'general' ];
  }

  protected function register_controls() {
    ${opts.controls.map(({ label, name, tab, controls }) => `
    $this->start_controls_section(
      '${name}',
      [
        'label' => '${label}',
        'tab' => \Elementor\Controls_Manager::${tab},
      ]
    );
    ${controls.map(control => widgetControlTemplate(control)).join('\n')}
    $this->end_controls_section();
    `).join('\n')}
  }

  protected function render() {
    ${opts.controls.flatMap(({ controls }) => controls).filter(({ inlineEditable }) => inlineEditable).map(({ name }) => `
    $this->add_inline_editing_attributes( '${name}', 'none' );
    `).join('\n')}

    $renderData = [
      $inlineEditableAttributes => [
        ${opts.controls.flatMap(({ controls }) => controls).filter(({ inlineEditable }) => inlineEditable).map(({ name }) => `
      '${name}' => $this->get_render_attribute_string( '${name}' ),
      `).join('\n')}
      ],
      $settings => $this->get_settings_for_display()
    ];

    $html = [];
    exec('node ' . plugin_dir_url( __FILE__ ) . 'assets/ssr.cjs ' . json_encode($renderDate), $html);

    for($i=0;$i<count($html);$i++){
      echo $html[$i];
    }
  }
}
`

export const widgetClientScriptTemplate = () => `
import test from './component.vue'

const vue = (window as any).Vue as typeof import('vue')
const app = vue.createSSRApp(test)

app.mount('#app')
`
