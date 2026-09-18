Feature: Automated Job Search and Application

  @job_search @pune
  Scenario Outline: Filter and apply only to Pune jobs without external site redirection
    Given I navigate to the Naukri homepage
    When I log in to Naukri with valid credentials
    Then I should be logged in to Naukri successfully
    When the user searches for "<Role>" with "<Experience>"
    And filters the job location by "Pune"
    Then the user reviews the available job listings
    And applies only to jobs with direct application and skips external redirects

    Examples:
      | Role                      | Experience |
      | QA Automation Engineer    | 2 Years    |
      | Playwright Test Engineer  | 2 Years    |
      | Cypress Automation Tester | 2 Years    |