#
# Be sure to run `pod lib lint dkd-objc.podspec' to ensure this is a
# valid spec before submitting.
#
# Any lines starting with a # are optional, but their use is encouraged
# To learn more about a Podspec see https://guides.cocoapods.org/syntax/podspec.html
#

Pod::Spec.new do |s|
  s.name             = 'FiniteStateMachine'
  s.version          = '1.0'
  s.summary          = 'Finite State Machine'
  s.homepage         = 'https://github.com/moky'
  s.license          = { :type => 'MIT', :file => 'LICENSE' }
  s.author           = { 'DIM' => 'john.chen@infothinker.com' }
  s.source           = { :git => 'https://github.com/moky/FiniteStateMachine.git', :tag => s.version.to_s }
  s.ios.deployment_target = '11.0'
  s.requires_arc = false
  s.source_files = 'Classes/**/*', 'ds/**/*', 'fsm/**/*'

  s.public_header_files = 'Classes/*.h'

  # s.public_header_files = 'Pod/Classes/**/*.h'
  # s.frameworks = 'UIKit', 'MapKit'
  # s.dependency 'AFNetworking', '~> 2.3'
end
