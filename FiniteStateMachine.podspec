#
# Be sure to run `pod lib lint fsm-objc.podspec' to ensure this is a
# valid spec before submitting.
#
# Any lines starting with a # are optional, but their use is encouraged
# To learn more about a Podspec see https://guides.cocoapods.org/syntax/podspec.html
#

Pod::Spec.new do |s|
    s.name                  = 'FiniteStateMachine'
    s.version               = '2.2.4'
    s.summary               = 'FSM'
    s.description           = <<-DESC
            Finite State Machine
                              DESC
    s.homepage              = 'https://github.com/moky/FiniteStateMachine'
    s.license               = { :type => 'MIT', :file => 'LICENSE' }
    s.author                = { 'Albert Moky' => 'albert.moky@gmail.com' }
    s.source                = { :git => 'https://github.com/moky/FiniteStateMachine.git', :tag => s.version.to_s }
    # s.platform            = :ios, "11.0"
    s.ios.deployment_target = '11.0'
    
    s.source_files          = 'fsm-objc/**/*.{h,m}', 'ds-c/*.{h,c}', 'fsm-c/*.{h,c}'
    # s.exclude_files       = 'Classes/Exclude'
    s.public_header_files   = 'fsm-objc/*.h', 'fsm-objc/threading/*.h'

    # s.frameworks          = 'Security'
    s.requires_arc          = false

    s.dependency 'ObjectKey', '~> 0.1.2'
end
