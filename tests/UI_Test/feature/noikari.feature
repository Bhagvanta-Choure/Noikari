@naukri
Feature: Naukri Login

  @TC-NAUKRI-01
  Scenario: Login to Naukri with valid credentials
    Given I navigate to the Naukri homepage
    When I log in to Naukri with valid credentials
    Then I should be logged in to Naukri successfully

@TC-NAUKRI-02
Scenario: Login and Apply for Playwright Jobs
    Given I navigate to the Naukri homepage
    When I log in to Naukri with valid credentials
    Then I should be logged in to Naukri successfully
    When I search for "Playwright Automation Tester" jobs in "Pune"
    Then I apply to top 20 easy apply jobs
