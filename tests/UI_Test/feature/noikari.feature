@naukri
Feature: Naukri Login

  @TC-NAUKRI-01
  Scenario: Login to Naukri with valid credentials
    Given I navigate to the Naukri homepage
    When I log in to Naukri with valid credentials
    Then I should be logged in to Naukri successfully
