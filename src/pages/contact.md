---
sections:
  - background: gray
    content: >-
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam a metus
      quis lorem malesuada luctus. Cras lacinia, eros at dapibus molestie, risus
      tortor pretium ligula.
    form_fields:
      - input_type: text
        is_required: true
        label: Name
        name: name
        type: form_field
      - input_type: email
        is_required: true
        label: Email
        name: email
        type: form_field
      - default_value: Please select
        input_type: select
        label: Subject
        name: subject
        options:
          - Error on the site
          - Sponsorship
          - Other
        type: form_field
      - input_type: textarea
        label: Message
        name: message
        type: form_field
      - input_type: checkbox
        is_required: true
        label: >-
          I understand that this form is storing my submitted information so I
          can be contacted.
        name: consent
        type: form_field
    form_id: contactForm
    section_id: contact
    submit_label: Send Message
    title: Contact
    type: section_contact
stackbit_url_path: /contact
template: landing
title: Contact
---
