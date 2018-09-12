# -*- encoding: utf-8 -*-
# stub: simctl 1.6.5 ruby lib

Gem::Specification.new do |s|
  s.name = "simctl"
  s.version = "1.6.5"

  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib"]
  s.authors = ["Johannes Plunien"]
  s.date = "2018-06-20"
  s.description = "Ruby interface to xcrun simctl"
  s.email = ["plu@pqpq.de"]
  s.homepage = "https://github.com/plu/simctl"
  s.licenses = ["MIT"]
  s.rubygems_version = "2.2.2"
  s.summary = "Ruby interface to xcrun simctl"

  s.installed_by_version = "2.2.2" if s.respond_to? :installed_by_version

  if s.respond_to? :specification_version then
    s.specification_version = 4

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_development_dependency(%q<coveralls>, [">= 0"])
      s.add_development_dependency(%q<rake>, [">= 0"])
      s.add_development_dependency(%q<rspec>, [">= 0"])
      s.add_development_dependency(%q<rubocop>, [">= 0"])
      s.add_runtime_dependency(%q<CFPropertyList>, [">= 0"])
      s.add_runtime_dependency(%q<naturally>, [">= 0"])
    else
      s.add_dependency(%q<coveralls>, [">= 0"])
      s.add_dependency(%q<rake>, [">= 0"])
      s.add_dependency(%q<rspec>, [">= 0"])
      s.add_dependency(%q<rubocop>, [">= 0"])
      s.add_dependency(%q<CFPropertyList>, [">= 0"])
      s.add_dependency(%q<naturally>, [">= 0"])
    end
  else
    s.add_dependency(%q<coveralls>, [">= 0"])
    s.add_dependency(%q<rake>, [">= 0"])
    s.add_dependency(%q<rspec>, [">= 0"])
    s.add_dependency(%q<rubocop>, [">= 0"])
    s.add_dependency(%q<CFPropertyList>, [">= 0"])
    s.add_dependency(%q<naturally>, [">= 0"])
  end
end