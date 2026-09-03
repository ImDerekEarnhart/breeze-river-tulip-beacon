from arc_agent.dynamics_tournament import run

def test_translation_generalizes_better_than_absolute_edits(tmp_path):
 r=run(tmp_path);assert r["primary_success_check_passed"];assert r["findings"]["rigid_object_translation"]["accuracy"]==1.0;assert r["findings"]["absolute_pixel_edit"]["accuracy"]==0.0
