"""Startup seed: demo users and three rich meetings when the database is empty."""

from datetime import date, timedelta

from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.models import ActionItem, Meeting, User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

DISCOVERY_TRANSCRIPT = """Project Discovery and MVP Planning Meeting (Customer Support Automation Platform)

Date: 12 March 2026
Attendees: Maria (Product Lead), James (Engineering), Neha (Operations), Arjun (Knowledge / CX), Riya (Delivery)

Maria: Welcome everyone. Today's goal is to lock the MVP for the Customer Support Automation Platform. We have a six-week window and we cannot boil the ocean. James, can you recap the integration constraint?

James: Zendesk stays the system of record. We should not write tickets directly from the bot runtime. I recommend an adapter layer that maps our intents to Zendesk tickets, comments, and tags. That keeps us portable if we add Freshdesk later.

Neha: Operations agrees. Agents already live in Zendesk. If we bypass it, reporting breaks. One hard rule from finance: refunds above €50 must stay human-in-the-loop. Smaller refunds can auto-process if we keep an audit log.

Arjun: The knowledge base is the real risk. Top 50 intents are decent in English, but policy pages for partial refunds and multi-currency are incomplete. If we automate too early we will send wrong answers.

Riya: Delivery-wise, six weeks is aggressive but doable if we freeze scope. I propose weekly stakeholder checkpoints and a gated production rollout, not a big-bang cutover.

Maria: Scope freeze then. MVP channels are email and chat only. Voice, WhatsApp, and social are out. James, can the adapter spike land in week two?

James: Yes. I will spike tickets, comments, and tags against the Zendesk sandbox in week two. Latency under peak volume is still an unanswered question.

Neha: I will map the refund policy this week, including the €50 threshold and the edge cases. Legal still needs to confirm automated refunds under €50 across EU markets.

Arjun: I will audit the knowledge base for the top 50 ticket intents by week two and publish a gap list. Who owns the content freeze before the first production cohort?

Riya: I will own the checkpoint cadence and the success metrics dashboard in week one. We also need an acceptable false-automation rate for the first two weeks — that is still open.

Maria: Decisions for the notes: Zendesk via adapter, MVP is email and chat, six-week target, human-in-the-loop for refunds greater than €50. I will draft the MVP PRD covering channels, refunds, and adapter contracts by end of week one.

James: Agreed. Please include which Zendesk custom fields must be preserved for reporting. That is still unanswered.

Neha: Approved on the refunds guardrail. I will chase legal on the timeline.

Arjun: Agreed, with the knowledge-base risk called out explicitly.

Riya: Locked. Weekly checkpoints start next Monday. Let's ship a usable MVP, not a perfect one.
"""

RETRO_TRANSCRIPT = """Sprint 14 Retrospective — Internal Delivery Guild

Priya: What went well? The adapter spike landed and first-response time dropped 18%.

Omar: The Kanban WIP limit actually held this time. Fewer context switches.

Lina: Blockers: staging certificates expired mid-week and blocked the demo. Also the design tokens were not published until Thursday.

Priya: Decision: rotate staging certs automatically and publish tokens on Monday of every sprint.

Omar: I will add the cert rotation runbook by Friday. High priority.

Lina: I will move token publishing to the sprint-start checklist. Due next Monday.

Priya: Remaining question: should we add a fourth column for "Waiting on Legal"?
"""

SALES_TRANSCRIPT = """Client Meeting — Northwind Retail Q3 Expansion

Elena: Northwind wants chat automation in three EU locales by September.

Samir: They asked whether we can reuse the Zendesk adapter. I said yes, with a tenant isolation review.

Elena: Decision: proceed with a paid discovery for locale expansion. Do not commit to WhatsApp in Q3.

Samir: Risk: their current SLA is 2 minutes; our chat MVP is not load-tested at that volume.

Elena: Action — Samir to send a scoped SOW by Thursday. I will schedule the security questionnaire with their CISO.
"""


def seed_if_empty(db: Session) -> None:
    if db.query(User).first() is not None:
        return

    admin = User(
        email="admin@zignuts.com",
        full_name="Maria Chen",
        hashed_password=pwd_context.hash("adminpass123"),
        role="admin",
    )
    member = User(
        email="member@zignuts.com",
        full_name="James Okonkwo",
        hashed_password=pwd_context.hash("memberpass123"),
        role="member",
    )
    db.add_all([admin, member])
    db.flush()

    discovery = Meeting(
        user_id=admin.id,
        title="Project Discovery and MVP Planning Meeting (Customer Support Automation Platform)",
        meeting_date=date(2026, 3, 12),
        meeting_type="Requirement Discussion",
        participants=["Maria", "James", "Neha", "Arjun", "Riya"],
        raw_transcript=DISCOVERY_TRANSCRIPT,
        notes="Pre-seeded discovery session used for evaluator walkthroughs.",
        summary={
            "purpose": (
                "Align on MVP scope, integration strategy, and delivery timeline for a "
                "Customer Support Automation Platform spanning email and chat."
            ),
            "key_points": [
                "Zendesk remains the system of record; integration must go through a dedicated adapter layer.",
                "MVP channels are limited to email and chat; voice and social are deferred.",
                "Human-in-the-loop is mandatory for refunds above €50.",
                "Six-week target for a usable MVP with weekly stakeholder checkpoints.",
                "Knowledge base quality and multilingual coverage are gating factors for accuracy.",
            ],
            "outcomes": [
                "Agreed adapter-based Zendesk integration rather than a direct database write.",
                "Locked MVP surface area to email and live chat.",
                "Confirmed 6-week delivery target with a staged rollout.",
                "Defined refund automation guardrail at €50 with human approval above that threshold.",
            ],
            "concerns": [
                "Knowledge-base gaps could cause incorrect automated replies in week one.",
                "Refund policy edge cases (partial refunds, multi-currency) are not fully documented.",
                "Latency of the Zendesk adapter under peak ticket volume is unproven.",
            ],
            "next_steps": [
                "Publish the MVP PRD covering channels, refunds, and adapter contracts.",
                "Stand up the Zendesk sandbox and adapter spike.",
                "Draft the human-in-the-loop refund playbook.",
                "Schedule weekly discovery-to-delivery checkpoints.",
            ],
        },
        decisions=[
            "Zendesk integration will be implemented via an adapter layer rather than direct API writes from the bot runtime.",
            "MVP channels are email and chat only; voice, WhatsApp, and social are out of scope.",
            "The team will target a 6-week MVP with a gated production rollout.",
            "Human-in-the-loop is required for refunds greater than €50; lower amounts may auto-process with audit logs.",
        ],
        risks=[
            "Incomplete knowledge base may produce incorrect automated answers for policy questions.",
            "Unclear partial-refund and multi-currency rules could stall automation go-live.",
            "Adapter latency or Zendesk rate limits could degrade first-response SLA.",
            "Legal sign-off on automated refunds is still outstanding.",
        ],
        unanswered_questions=[
            "What is the legal position on automated refunds under €50 across EU markets?",
            "Which Zendesk custom fields must be preserved for reporting?",
            "Who owns the knowledge-base content freeze before the first production cohort?",
            "What is the acceptable false-automation rate for the first two weeks?",
        ],
        ai_processed=True,
    )

    retro = Meeting(
        user_id=member.id,
        title="Sprint 14 Retrospective — Delivery Guild",
        meeting_date=date.today() - timedelta(days=4),
        meeting_type="Retrospective",
        participants=["Priya", "Omar", "Lina"],
        raw_transcript=RETRO_TRANSCRIPT,
        notes="Internal retro with cert-rotation follow-up.",
        summary={
            "purpose": "Inspect Sprint 14 delivery health and lock process improvements.",
            "key_points": [
                "Adapter spike reduced first-response time by 18%.",
                "WIP limits improved focus.",
                "Expired staging certificates blocked the mid-week demo.",
            ],
            "outcomes": [
                "Automatic staging certificate rotation approved.",
                "Design tokens will publish on Monday of every sprint.",
            ],
            "concerns": ["Demo risk from certificate expiry.", "Late design-token publishing."],
            "next_steps": ["Publish cert rotation runbook.", "Move tokens onto the sprint-start checklist."],
        },
        decisions=[
            "Rotate staging certificates automatically.",
            "Publish design tokens on Monday of every sprint.",
        ],
        risks=["Expired staging certificates can block stakeholder demos."],
        unanswered_questions=["Should the board add a Waiting on Legal column?"],
        ai_processed=True,
    )

    sales = Meeting(
        user_id=admin.id,
        title="Northwind Retail Q3 Expansion Discovery",
        meeting_date=date.today() - timedelta(days=1),
        meeting_type="Client Meeting",
        participants=["Elena", "Samir", "Northwind CISO"],
        raw_transcript=SALES_TRANSCRIPT,
        notes="Commercial discovery — do not commit WhatsApp in Q3.",
        summary={
            "purpose": "Qualify Northwind's Q3 chat automation expansion across three EU locales.",
            "key_points": [
                "Client wants chat automation in three locales by September.",
                "Zendesk adapter can be reused with a tenant isolation review.",
                "WhatsApp is explicitly out of Q3 scope.",
            ],
            "outcomes": ["Proceed with a paid discovery for locale expansion."],
            "concerns": ["2-minute SLA is unproven on the current chat MVP."],
            "next_steps": ["Send scoped SOW.", "Schedule CISO security questionnaire."],
        },
        decisions=[
            "Proceed with paid discovery for locale expansion.",
            "Do not commit to WhatsApp in Q3.",
        ],
        risks=["Chat MVP is not load-tested against a 2-minute first-response SLA."],
        unanswered_questions=["Can tenant isolation on the Zendesk adapter pass Northwind security review?"],
        ai_processed=True,
    )

    db.add_all([discovery, retro, sales])
    db.flush()

    yesterday = (date.today() - timedelta(days=1)).isoformat()
    next_week = (date.today() + timedelta(days=7)).isoformat()

    db.add_all(
        [
            ActionItem(
                meeting_id=discovery.id,
                task_description="Draft and circulate the MVP PRD covering email/chat scope, refunds, and adapter contracts.",
                owner="Maria",
                due_date="End of week 1",
                priority="High",
                status="In Progress",
            ),
            ActionItem(
                meeting_id=discovery.id,
                task_description="Spike Zendesk adapter (tickets, comments, tags) against the sandbox environment.",
                owner="James",
                due_date="Week 2",
                priority="High",
                status="Open",
            ),
            ActionItem(
                meeting_id=discovery.id,
                task_description="Map refund policy rules including the €50 human-in-the-loop threshold and edge cases.",
                owner="Neha",
                due_date=yesterday,
                priority="High",
                status="Blocked",
            ),
            ActionItem(
                meeting_id=discovery.id,
                task_description="Prepare knowledge-base content audit and gap list for top 50 ticket intents.",
                owner="Arjun",
                due_date="Week 2",
                priority="Medium",
                status="Open",
            ),
            ActionItem(
                meeting_id=discovery.id,
                task_description="Design weekly stakeholder checkpoint cadence and success metrics dashboard.",
                owner="Riya",
                due_date=next_week,
                priority="Medium",
                status="Completed",
            ),
            ActionItem(
                meeting_id=discovery.id,
                task_description="Confirm legal review timeline for automated refunds under €50.",
                owner="Neha",
                due_date="Not specified",
                priority="High",
                status="Open",
            ),
            ActionItem(
                meeting_id=retro.id,
                task_description="Add the staging certificate rotation runbook.",
                owner="Omar",
                due_date=yesterday,
                priority="High",
                status="Open",
            ),
            ActionItem(
                meeting_id=retro.id,
                task_description="Move design-token publishing to the sprint-start checklist.",
                owner="Lina",
                due_date=next_week,
                priority="Medium",
                status="In Progress",
            ),
            ActionItem(
                meeting_id=sales.id,
                task_description="Send scoped SOW for Northwind locale expansion discovery.",
                owner="Samir",
                due_date=yesterday,
                priority="High",
                status="In Progress",
            ),
            ActionItem(
                meeting_id=sales.id,
                task_description="Schedule security questionnaire with Northwind CISO.",
                owner="Elena",
                due_date=next_week,
                priority="Medium",
                status="Open",
            ),
        ]
    )
    db.commit()
